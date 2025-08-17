import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { ReverseGeocodeRequestSchema, ReverseGeocodeResponseSchema } from "../../services/geocoding";
import { db } from "../../db/init";
import { GeocodingController } from "../../controllers/geocoding.controller";
import { AuthController } from "../../controllers/auth.controller";
import { config } from "../../../config";

/**
 * route mounted at /v1/locate
 */
const route = new Elysia({ prefix: "/locate" })
  .use(jwt({
    name: "jwt",
    secret: config.keys.jwt,
  }))
  .decorate("ctrl", new GeocodingController(db))
  .decorate("authCtrl", new AuthController(db))
  .get("/", async ({ query, ctrl, headers, jwt, set, authCtrl }) => {
    // Authentication using centralized method
    const authResult = await authCtrl.authenticateRequest(headers, jwt, set);
    if (authResult.error) return authResult.error;

    // Parse coordinates for city validation
    const lat = parseFloat(query.lat);
    const lng = parseFloat(query.lng);
    
    // Validate coordinates are within enabled cities
    const validationResult = ctrl.validateCoordinatesEnabled(lat, lng);
    if (!validationResult.isEnabled) {
      set.status = 403;
      return {
        error: "Service not available",
        message: `The requested coordinates (${lat}, ${lng}) are not within our service area. We currently provide services for the following cities:`,
        availableCities: validationResult.enabledCities,
        code: "COORDINATES_NOT_ENABLED"
      };
    }

    // User is authenticated and coordinates are enabled, proceed with the actual route logic
    return await ctrl.reverseGeocode(query.lat, query.lng);
  }, {
    query: ReverseGeocodeRequestSchema,
    response: {
      200: ReverseGeocodeResponseSchema,
      401: t.Object({
        message: t.String(),
      }),
      403: t.Object({
        error: t.String(),
        message: t.String(),
        availableCities: t.Array(t.Object({
          city: t.String(),
          country: t.String(),
        })),
        code: t.String(),
      }),
    },
    description: "Reverse geocode latitude and longitude to get location details. Requires JWT authentication.",
    tags: ["geocoding"],
    detail: {
      security: [{ bearerAuth: [] }]
    }
  });

export default route;