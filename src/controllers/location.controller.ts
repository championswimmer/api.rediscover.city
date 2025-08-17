import { DatabaseType } from "../db/init";
import { ReverseGeocodeResponse } from "../services/geocoding";
import {
  getLocationInfo as getLocationInfoFromService,
  LocationInfoResponse,
} from "../services/locationinfo";
import { eq } from "drizzle-orm";
import { locationInfoTable } from "../db/schema";
import adze from "adze";

export class LocationController {
  private readonly db: DatabaseType;
  constructor(db: DatabaseType) {
    this.db = db;
  }

  async getLocationInfo(
    location: ReverseGeocodeResponse,
    refresh: boolean = false
  ): Promise<LocationInfoResponse> {
    adze.info("Getting location info", { geohash: location.geohash, refresh });
    
    // If refresh is true, bypass cache and fetch fresh data
    if (refresh) {
      adze.warn("Refresh requested, bypassing cache", {
        geohash: location.geohash,
      });
      const response = await getLocationInfoFromService(location);
      // Delete existing record if it exists
      await this.db.delete(locationInfoTable).where(eq(locationInfoTable.geohash, location.geohash));
      // Insert new record
      await this.db.insert(locationInfoTable).values({
        geohash: location.geohash,
        ...response,
      });
      adze.info("Location info record refreshed", {
        geohash: location.geohash,
        locationInfoRecord: response,
      });
      return response;
    }
    
    const locationInfoRecord = await this.db
      .select()
      .from(locationInfoTable)
      .where(eq(locationInfoTable.geohash, location.geohash));

    if (locationInfoRecord.length > 0) {
      adze.info("Location info record found in cache", {
        geohash: location.geohash,
        locationInfoRecord,
      });
      return locationInfoRecord[0];
    }

    adze.warn("Location info record not found in cache, will fetch", {
      geohash: location.geohash,
    });
    const response = await getLocationInfoFromService(location);
    await this.db.insert(locationInfoTable).values({
      geohash: location.geohash,
      ...response,
    });
    adze.info("Location info record created", {
      geohash: location.geohash,
      locationInfoRecord: response,
    });
    return response;
  }
}