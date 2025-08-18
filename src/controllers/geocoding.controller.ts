import { DatabaseType } from "../db/init";
import { geohashTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { config } from "../../config";
import { reverseGeocode, ReverseGeocodeResponse } from "../services/geocoding";
import { checkCityEnabled, CityFilterResult } from "../services/cityfilter";
import ngeohash from "ngeohash";
import adze from "adze";

export class GeocodingController {
  private readonly db: DatabaseType;
  constructor(db: DatabaseType) {
    this.db = db;
  }

  async reverseGeocode(lat: string, lng: string): Promise<ReverseGeocodeResponse> {
    adze.info("Reverse geocoding", { lat, lng });
    const geohash = ngeohash.encode(lat, lng, config.geohashPrecision);
    const geohashRecord = await this.db.select().from(geohashTable).where(eq(geohashTable.geohash, geohash));
    if (geohashRecord.length > 0) {
      adze.debug("Geohash record found", { geohash, geohashRecord });
      return {
        ...geohashRecord[0],
        neighborhood: geohashRecord[0].neighborhood ?? undefined,
        street: geohashRecord[0].street ?? undefined,
      };
    }
    adze.fail("Geohash record not found, will reverse geocode", { geohash });
    const response = await reverseGeocode({ lat, lng });
    await this.db.insert(geohashTable).values({
      geohash,
      geopoint: { x: parseFloat(lng), y: parseFloat(lat) },
      country: response.country,
      city: response.city,
      locality: response.locality ?? "",
      sublocality: response.sublocality ?? "",
      neighborhood: response.neighborhood ?? "",
      street: response.street ?? "",
    });
    adze.debug("Geohash record created", { geohash, geohashRecord: response });
    return response;
  }

  async getLocationFromGeohash(geohash: string): Promise<ReverseGeocodeResponse | null> {
    adze.info("Getting location from geohash", { geohash });
    const geohashRecord = await this.db.select().from(geohashTable).where(eq(geohashTable.geohash, geohash));
    if (geohashRecord.length > 0) {
      adze.debug("Geohash record found", { geohash, geohashRecord });
      return {
        ...geohashRecord[0],
        neighborhood: geohashRecord[0].neighborhood ?? undefined,
        street: geohashRecord[0].street ?? undefined,
      };
    }
    adze.fail("Geohash record not found", { geohash });
    return null;
  }

  /**
   * Validates if the given coordinates are within any enabled city
   */
  validateCoordinatesEnabled(lat: number, lng: number): CityFilterResult {
    adze.info("Validating coordinates against enabled cities", { lat, lng });
    const result = checkCityEnabled(lat, lng);
    adze.success("City validation result", { lat, lng, isEnabled: result.isEnabled });
    return result;
  }
}