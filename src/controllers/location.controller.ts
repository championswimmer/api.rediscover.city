import { BunSQLDatabase } from "drizzle-orm/bun-sql";
import { GeohashModel } from "../db/schema.postgres";

export class LocationController {
  private readonly db: BunSQLDatabase;
  constructor(db: BunSQLDatabase) {
      this.db = db;
    }

    async getLocationInfo(location: GeohashModel): Promise<String> {
      return "Location Info";
    }
}