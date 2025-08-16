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
    // Authentication check
    const authorization = headers.authorization;
    
    if (!authorization) {
      set.status = 401;
      return { message: "Authorization header required" };
    }

    const token = authorization.startsWith("Bearer ")
      ? authorization.substring(7)
      : authorization;

    try {
      const payload = await jwt.verify(token);
      
      if (!payload || typeof payload !== "object" || !payload.userId) {
        set.status = 401;
        return { message: "Invalid token" };
      }

      const user = await authCtrl.getUserById(String(payload.userId));
      
      if (!user) {
        set.status = 401;
        return { message: "User not found" };
      }

      // User is authenticated, proceed with the actual route logic
      return await ctrl.reverseGeocode(query.lat, query.lng);
    } catch (error) {
      set.status = 401;
      return { message: "Invalid or expired token" };
    }
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