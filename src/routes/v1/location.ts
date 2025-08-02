import { Elysia } from "elysia";
import { LocationController } from "../../controllers/location.controller";
import { db } from "../../db/init";
import { GeocodingController } from "../../controllers/geocoding.controller";
import { LocationInfoRequestSchema, LocationInfoResponseSchema } from "../../services/locationinfo";

/**
 * route mounted at /v1/location
 */

const route = new Elysia({ prefix: "/location" })
  .decorate("locCtrl", new LocationController(db))
  .decorate("geoCtrl", new GeocodingController(db))
  .get("/info", async ({ query, locCtrl, geoCtrl, set }) => {
    // Check if geohash is provided
    if (query.geohash) {
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
    }
    
    // Check if lat and lng are provided
    if (query.lat && query.lng) {
      const lat = parseFloat(query.lat);
      const lng = parseFloat(query.lng);
      if (isNaN(lat) || isNaN(lng)) {
        set.status = 400;
        return {
          message: "Bad request: 'lat' and 'lng' must be valid numeric coordinates.",
        };
      }
      const location = await geoCtrl.reverseGeocode(query.lat, query.lng);
      const locationInfo = await locCtrl.getLocationInfo(location);
      return locationInfo;
    }
    
    // Neither geohash nor lat/lng provided
    set.status = 400;
    return {
      message: "Bad request: Either 'geohash' or both 'lat' and 'lng' parameters must be provided.",
    };
  }, {
    tags: ["location"],
    query: LocationInfoRequestSchema,
    response: LocationInfoResponseSchema,
    description: "Get detailed information about location. This uses an AI model to generate information.",
  })
  .get("/nearby", () => {
    return {
      message: "Hello World",
    };
  }, {
    tags: ["location"]
  })

export default route;