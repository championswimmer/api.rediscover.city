import { BunSQLDatabase } from "drizzle-orm/bun-sql";
import { ReverseGeocodeResponse } from "../services/geocoding";

export class LocationController {
  private readonly db: BunSQLDatabase;
  constructor(db: BunSQLDatabase) {
      this.db = db;
    }

    async getLocationInfo(location: ReverseGeocodeResponse): Promise<String> {
      return "Location Info";
    }
}