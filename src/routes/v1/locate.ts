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

    // User is authenticated, proceed with the actual route logic
    return await ctrl.reverseGeocode(query.lat, query.lng);
  }, {
    query: ReverseGeocodeRequestSchema,
    response: {
      200: ReverseGeocodeResponseSchema,
      401: t.Object({
        message: t.String(),
      }),
    },
    description: "Reverse geocode latitude and longitude to get location details. Requires JWT authentication.",
    tags: ["geocoding"],
    detail: {
      security: [{ bearerAuth: [] }]
    }
  });

export default route;