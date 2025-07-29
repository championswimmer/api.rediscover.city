import { Elysia } from "elysia";
import { LocationController } from "../../controllers/location.controller";
import { db } from "../../db/init";
import { GeocodingController } from "../../controllers/geocoding.controller";
import { LocationInfoRequestSchema } from "../../services/locationinfo";

/**
 * route mounted at /v1/location
 */

const route = new Elysia({ prefix: "/location" })
  .decorate("locCtrl", new LocationController(db))
  .decorate("geoCtrl", new GeocodingController(db))
  .get("/info", async ({ query, locCtrl, geoCtrl, set }) => {
    const location = await geoCtrl.getLocationFromGeohash(query.geohash);
    if (!location) {
      set.status = 404;
      return {
        message: `Could not find location info for the given geohash: ${query.geohash}. ` +
          `Did you first call the /v1/locate endpoint with lat/lng to get the location?`,
      };
    }
    const locationInfo = await locCtrl.getLocationInfo(location);
    return locationInfo;
  }, {
    tags: ["location"],
    query: LocationInfoRequestSchema,
  })
  .get("/nearby", () => {
    return {
      message: "Hello World",
    };
  }, {
    tags: ["location"]
  })

export default route;