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
    location: ReverseGeocodeResponse
  ): Promise<LocationInfoResponse> {
    adze.info("Getting location info", { geohash: location.geohash });
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