import { Elysia } from "elysia";
import { reverseGeocode, ReverseGeocodeRequestSchema, ReverseGeocodeResponseSchema } from "../../services/geocoding";

/**
 * route mounted at /v1/locate
 */
const route = new Elysia({ prefix: "/v1/locate" })
  .get("/", async ({ query }) => {
    return await reverseGeocode(query);
  }, {
    query: ReverseGeocodeRequestSchema,
    response: ReverseGeocodeResponseSchema
  });

export default route;