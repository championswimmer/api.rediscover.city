/*
  Fetch updated city bounding boxes from OSM Nominatim and update src/data/enabled-cities.json

  Notes:
  - Uses structured search (city, country) with jsonv2
  - Prefers administrative boundary relations when available
  - Writes back minLat/minLon/maxLat/maxLon from Nominatim's boundingbox [south, north, west, east]
*/

import { readFile, writeFile } from 'fs/promises'

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
  if (!Array.isArray(json)) return []
  return json as NominatimResult[]
}

function pickBestCandidate(candidates: NominatimResult[], city: string, country: string): NominatimResult | null {
  if (!candidates.length) return null

  // Rank candidates by our heuristic
  const ranked = candidates
    .map((c) => ({ c, s: scoreCandidate(c, city, country) }))
    .sort((a, b) => b.s - a.s)

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
  const raw = await readFile(DATA_PATH, 'utf8')
  const cities: EnabledCity[] = JSON.parse(raw)

  const updated: EnabledCity[] = []
  const failures: { city: string; country: string; reason: string }[] = []

  for (const entry of cities) {
    const { country } = entry
    // Normalize some known naming quirks to cover the broader administrative area
    // e.g., use Delhi instead of New Delhi (NCT) for a larger, more representative bbox
    const city = entry.city === 'New Delhi' ? 'Delhi' : entry.city
    try {
      const results = await fetchCityCandidates(city, country)
      if (!results.length) {
        failures.push({ city, country, reason: 'no candidates' })
        continue
      }
      const best = pickBestCandidate(results, city, country)
      if (!best || !best.boundingbox) {
        failures.push({ city, country, reason: 'no suitable candidate with bbox' })
        continue
      }
      const { minLat, minLon, maxLat, maxLon } = bboxToMinMax(best.boundingbox)
      // Preserve original display name as in the JSON (e.g., keep "New Delhi")
      updated.push({ city: entry.city, country, minLat, minLon, maxLat, maxLon })

      // Be nice to Nominatim
      await sleep(1100)
    } catch (error) {
      failures.push({ city, country, reason: (error as Error).message })
    }
  }

  if (updated.length) {
    const formatted = JSON.stringify(updated, null, 2)
    await writeFile(DATA_PATH, formatted + '\n', 'utf8')
  }

  if (failures.length) {
    // eslint-disable-next-line no-console
    console.warn('Failed to update some cities:', failures)
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})


