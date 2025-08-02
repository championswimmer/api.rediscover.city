import { Elysia } from "elysia";
import { ReverseGeocodeRequestSchema, ReverseGeocodeResponseSchema } from "../../services/geocoding";
import { db } from "../../db/init";
import { GeocodingController } from "../../controllers/geocoding.controller";

/**
 * route mounted at /v1/locate
 */
const route = new Elysia({ prefix: "/locate" })
  .decorate("ctrl", new GeocodingController(db))
  .get("/", async ({ query, ctrl }) => {
    return await ctrl.reverseGeocode(query.lat, query.lng);
  }, {
    query: ReverseGeocodeRequestSchema,
    response: ReverseGeocodeResponseSchema,
    description: "Reverse geocode latitude and longitude to get location details.",
    tags: ["geocoding"]
  });

export default route;