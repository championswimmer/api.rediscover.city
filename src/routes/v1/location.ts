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
  .get("/info", async ({ query, locCtrl, geoCtrl }) => {
    const location = await geoCtrl.getLocationFromGeohash(query.geohash);
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