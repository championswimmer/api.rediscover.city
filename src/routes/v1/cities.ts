import { Elysia, t } from "elysia";
import { getEnabledCities } from "../../services/cityfilter";

// Response schema for the cities endpoint
export const CitiesResponseSchema = t.Array(
  t.Object({
    city: t.String({ examples: ["New York", "London", "Paris"] }),
    country: t.String({ examples: ["United States", "United Kingdom", "France"] }),
  })
);

/**
 * Cities route mounted at /v1/cities
 */
const route = new Elysia({ prefix: "/cities" })
  .get("/", () => {
    return getEnabledCities();
  }, {
    response: {
      200: CitiesResponseSchema,
    },
    description: "Get the list of cities where the service is enabled",
    tags: ["cities"],
    detail: {
      security: [] // Public endpoint, no authentication required
    }
  });

export default route;