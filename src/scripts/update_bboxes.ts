/*
  Fetch updated city bounding boxes from OSM Nominatim and update src/data/enabled-cities.json

  Notes:
  - Uses structured search (city, country) with jsonv2
  - Prefers administrative boundary relations when available
  - Writes back minLat/minLon/maxLat/maxLon from Nominatim's boundingbox [south, north, west, east]
*/

import { readFile, writeFile } from 'fs/promises'
import adze from 'adze'

type EnabledCity = {
  city: string
  country: string
  minLat: number
  minLon: number
  maxLat: number
  maxLon: number
}

type NominatimResult = {
  place_id: number
  osm_type: 'node' | 'way' | 'relation'
  osm_id: number
  boundingbox?: [string, string, string, string]
  class?: string
  type?: string
  addresstype?: string
  display_name?: string
  extratags?: Record<string, string>
  importance?: number
}

const DATA_PATH = new URL('../data/enabled-cities.json', import.meta.url).pathname

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

function toNumber(value: string | number | undefined, fallback: number): number {
  if (value === undefined) return fallback
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function scoreCandidate(result: NominatimResult, city: string, country: string): number {
  let score = 0
  const name = (result.display_name ?? '').toLowerCase()
  const cityLower = city.toLowerCase()
  const countryLower = country.toLowerCase()

  // Prefer administrative boundary relations
  if (result.class === 'boundary') score += 50
  if (result.type === 'administrative') score += 30
  if (result.osm_type === 'relation') score += 20

  // Address type hints
  if (result.addresstype === 'city') score += 12
  if (result.addresstype === 'administrative') score += 8
  if (result.addresstype === 'municipality') score += 8

  // Name matching
  if (name.includes(cityLower)) score += 10
  if (name.includes(countryLower)) score += 5

  // Prefer results with bounding boxes
  if (result.boundingbox && result.boundingbox.length === 4) score += 15

  // Prefer mid-level admin levels for cities (avoid national/provincial when possible)
  const adminLevel = result.extratags?.['admin_level']
  if (adminLevel) {
    const levelNum = Number(adminLevel)
    if (Number.isFinite(levelNum)) {
      // City-ish levels are often around 6-10 depending on country; reward those
      if (levelNum >= 5 && levelNum <= 10) score += 10
      // Penalize very high-level (country/state) or very low-level
      if (levelNum < 4 || levelNum > 12) score -= 5
    }
  }

  // Importance as a light tiebreaker
  if (result.importance) score += Math.min(5, Math.max(0, result.importance))

  return score
}

async function fetchCityCandidates(city: string, country: string): Promise<NominatimResult[]> {
  const base = 'https://nominatim.openstreetmap.org/search'
  const search = new URLSearchParams({
    format: 'jsonv2',
    city,
    country,
    addressdetails: '1',
    extratags: '1',
    polygon_geojson: '0',
    limit: '10'
  })
  const url = `${base}?${search.toString()}`

  adze.debug("Making Nominatim API request", {
    city,
    country,
    url: url.replace(/([?&])([^=]+)=([^&]*)/g, (match, sep, key, value) =>
      sep + key + '=' + (key === 'format' || key === 'city' || key === 'country' ? value : '[HIDDEN]')
    )
  })

  const res = await fetch(url, {
    headers: {
      // Please customize contact to respect Nominatim usage policy if needed
      'User-Agent': 'rediscover.city bbox updater (contact: hello@rediscover.city)'
    }
  })
  if (!res.ok) {
    throw new Error(`Nominatim request failed for ${city}, ${country}: ${res.status} ${res.statusText}`)
  }

  const json = (await res.json()) as unknown
  if (!Array.isArray(json)) {
    adze.warn("Nominatim response was not an array", { city, country, responseType: typeof json })
    return []
  }

  adze.debug("Received Nominatim response", {
    city,
    country,
    resultCount: json.length
  })

  return json as NominatimResult[]
}

function pickBestCandidate(candidates: NominatimResult[], city: string, country: string): NominatimResult | null {
  if (!candidates.length) {
    adze.debug("No candidates to pick from", { city, country })
    return null
  }

  // Rank candidates by our heuristic
  const ranked = candidates
    .map((c) => ({ c, s: scoreCandidate(c, city, country) }))
    .sort((a, b) => b.s - a.s)

  adze.debug("Selected best candidate", {
    city,
    country,
    selectedCandidate: {
      displayName: ranked[0].c.display_name,
      type: ranked[0].c.type,
      class: ranked[0].c.class,
      osmType: ranked[0].c.osm_type,
      importance: ranked[0].c.importance,
      score: ranked[0].s
    },
    totalCandidates: candidates.length,
    hasBoundingBox: !!ranked[0].c.boundingbox,
    boundingBox: ranked[0].c.boundingbox
  })

  return ranked[0]?.c ?? null
}

function bboxToMinMax(bbox: [string, string, string, string]): { minLat: number; minLon: number; maxLat: number; maxLon: number } {
  const south = toNumber(bbox[0], 0)
  const north = toNumber(bbox[1], 0)
  const west = toNumber(bbox[2], 0)
  const east = toNumber(bbox[3], 0)
  return {
    minLat: south,
    minLon: west,
    maxLat: north,
    maxLon: east
  }
}

async function main(): Promise<void> {
  adze.info("Starting city bounding box update process")
  adze.info("Reading enabled cities data", { dataPath: DATA_PATH })

  const raw = await readFile(DATA_PATH, 'utf8')
  const cities: EnabledCity[] = JSON.parse(raw)

  adze.info("Loaded city data", {
    totalCities: cities.length,
    cities: cities.map(c => ({ city: c.city, country: c.country }))
  })

  cities.forEach(city => {
    adze.info("Will update bounding box for city", {
      city: city.city,
      country: city.country,
      currentBounds: {
        minLat: city.minLat,
        minLon: city.minLon,
        maxLat: city.maxLat,
        maxLon: city.maxLon
      }
    })
  })

  const updated: EnabledCity[] = []
  const failures: { city: string; country: string; reason: string }[] = []

  for (const entry of cities) {
    const { country } = entry
    // Normalize some known naming quirks to cover the broader administrative area
    // e.g., use Delhi instead of New Delhi (NCT) for a larger, more representative bbox
    const city = entry.city === 'New Delhi' ? 'Delhi' : entry.city

    adze.info("Processing city", {
      originalCity: entry.city,
      searchCity: city,
      country,
      currentBounds: {
        minLat: entry.minLat,
        minLon: entry.minLon,
        maxLat: entry.maxLat,
        maxLon: entry.maxLon
      }
    })

    try {
      adze.debug("Fetching candidates from Nominatim", { city, country })
      const results = await fetchCityCandidates(city, country)

      if (!results.length) {
        adze.warn("No candidates found for city", { city, country })
        failures.push({ city, country, reason: 'no candidates' })
        continue
      }

      adze.info("Found candidates from Nominatim", {
        city,
        country,
        candidateCount: results.length,
        topCandidates: results.slice(0, 3).map(r => ({
          displayName: r.display_name,
          type: r.type,
          class: r.class,
          osmType: r.osm_type,
          importance: r.importance
        }))
      })

      const best = pickBestCandidate(results, city, country)
      if (!best || !best.boundingbox) {
        adze.warn("No suitable candidate with bounding box found", {
          city,
          country,
          bestCandidate: best ? {
            displayName: best.display_name,
            type: best.type,
            class: best.class
          } : null
        })
        failures.push({ city, country, reason: 'no suitable candidate with bbox' })
        continue
      }

      const { minLat, minLon, maxLat, maxLon } = bboxToMinMax(best.boundingbox)
      adze.info("Selected best candidate and updated bounding box", {
        city,
        country,
        candidate: {
          displayName: best.display_name,
          type: best.type,
          class: best.class,
          osmType: best.osm_type,
          importance: best.importance
        },
        oldBounds: {
          minLat: entry.minLat,
          minLon: entry.minLon,
          maxLat: entry.maxLat,
          maxLon: entry.maxLon
        },
        newBounds: {
          minLat,
          minLon,
          maxLat,
          maxLon
        },
        boundingBox: best.boundingbox
      })

      // Preserve original display name as in the JSON (e.g., keep "New Delhi")
      updated.push({ city: entry.city, country, minLat, minLon, maxLat, maxLon })

      // Be nice to Nominatim
      adze.debug("Waiting before next request", { waitMs: 1100 })
      await sleep(1100)
    } catch (error) {
      adze.error("Failed to update city bounding box", {
        city,
        country,
        error: (error as Error).message
      })
      failures.push({ city, country, reason: (error as Error).message })
    }
  }

  if (updated.length) {
    adze.info("Writing updated city data to file", {
      updatedCount: updated.length,
      filePath: DATA_PATH
    })
    const formatted = JSON.stringify(updated, null, 2)
    await writeFile(DATA_PATH, formatted + '\n', 'utf8')
    adze.info("Successfully updated city bounding boxes", {
      totalUpdated: updated.length,
      totalCities: cities.length,
      successRate: `${((updated.length / cities.length) * 100).toFixed(1)}%`
    })
  }

  if (failures.length) {
    adze.warn("Some cities failed to update", {
      failureCount: failures.length,
      failures: failures.map(f => ({
        city: f.city,
        country: f.country,
        reason: f.reason
      }))
    })
  }

  adze.info("City bounding box update process completed", {
    totalProcessed: cities.length,
    successful: updated.length,
    failed: failures.length,
    successRate: `${((updated.length / cities.length) * 100).toFixed(1)}%`
  })
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})


