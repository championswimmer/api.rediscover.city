import { DatabaseType } from "../db/init";
import { geohashTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { config } from "../config";
import { reverseGeocode, ReverseGeocodeResponse } from "../services/geocoding";
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
      adze.info("Geohash record found", { geohash, geohashRecord });
      return {
        ...geohashRecord[0],
        neighborhood: geohashRecord[0].neighborhood ?? undefined,
        street: geohashRecord[0].street ?? undefined,
      };
    }
    adze.warn("Geohash record not found, will reverse geocode", { geohash });
    const response = await reverseGeocode({ lat, lng });
    await this.db.insert(geohashTable).values({
      geohash,
      geopoint: { x: parseFloat(lng), y: parseFloat(lat) },
      country: response.country,
      city: response.city,
      locality: response.locality ?? "",
      neighborhood: response.neighborhood ?? "",
      street: response.street ?? "",
    });
    adze.info("Geohash record created", { geohash, geohashRecord: response });
    return response;
  }

  async getLocationFromGeohash(geohash: string): Promise<ReverseGeocodeResponse | null> {
    adze.info("Getting location from geohash", { geohash });
    const geohashRecord = await this.db.select().from(geohashTable).where(eq(geohashTable.geohash, geohash));
    if (geohashRecord.length > 0) {
      adze.info("Geohash record found", { geohash, geohashRecord });
      return {
        ...geohashRecord[0],
        neighborhood: geohashRecord[0].neighborhood ?? undefined,
        street: geohashRecord[0].street ?? undefined,
      };
    }
    adze.warn("Geohash record not found", { geohash });
    return null;
  }
}