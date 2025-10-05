import { DatabaseType } from "../db/init";
import { ReverseGeocodeResponse } from "../services/geocoding";
import {
  getLocationInfo as getLocationInfoFromService,
  LocationInfoResponse,
} from "../services/locationinfo";
import { and, eq } from "drizzle-orm";
import { locationInfoTable } from "../db/schema";
import adze from "adze";

export class LocationController {
  private readonly db: DatabaseType;
  constructor(db: DatabaseType) {
    this.db = db;
  }

  async getLocationInfo(
    location: ReverseGeocodeResponse,
    refresh: boolean = false,
    language?: string
  ): Promise<LocationInfoResponse> {
    adze.info("Getting location info", { geohash: location.geohash, refresh });
    
    // If refresh is true, bypass cache and fetch fresh data
    if (refresh) {
      adze.warn("Refresh requested, bypassing cache", {
        geohash: location.geohash,
      });
      const response = await getLocationInfoFromService(location, language);
      // Delete existing record if it exists
      await this.db.delete(locationInfoTable).where(
        and(
          eq(locationInfoTable.geohash, location.geohash),
          eq(locationInfoTable.language, language || 'english')
        )
      );
      // Insert new record
      await this.db.insert(locationInfoTable).values({
        geohash: location.geohash,
        language: language || 'english',
        ...response,
      });
      adze.debug("Location info record refreshed", {
        geohash: location.geohash,
        locationInfoRecord: response,
      });
      return response;
    }
  
    // Try to find cached record with matching language
    const locationInfoRecord = await this.db
      .select()
      .from(locationInfoTable)
      .where(
        and(
          eq(locationInfoTable.geohash, location.geohash),
          eq(locationInfoTable.language, language || 'english')
        )
      );

    if (locationInfoRecord.length > 0) {
      adze.debug("Location info record found in cache", {
        geohash: location.geohash,
        locationInfoRecord,
      });
      return locationInfoRecord[0];
    }

    adze.fail("Location info record not found in cache, will fetch", {
      geohash: location.geohash,
    });
    const response = await getLocationInfoFromService(location, language);
    await this.db.insert(locationInfoTable).values({
      geohash: location.geohash,
      language: language || 'english',
      ...response,
    });
    adze.debug("Location info record created", {
      geohash: location.geohash,
      locationInfoRecord: response,
    });
    return response;
  }
}