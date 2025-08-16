import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { LocationController } from "../../controllers/location.controller";
import { db } from "../../db/init";
import { GeocodingController } from "../../controllers/geocoding.controller";
import { LocationInfoRequestSchema, LocationInfoResponseSchema } from "../../services/locationinfo";
import { AuthController } from "../../controllers/auth.controller";
import { config } from "../../../config";

/**
 * route mounted at /v1/location
 */

// Helper function to authenticate requests
async function authenticateRequest(headers: any, jwt: any, authCtrl: any, set: any) {
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

    return null; // Authentication successful
  } catch (error) {
    set.status = 401;
    return { message: "Invalid or expired token" };
  }
}

const route = new Elysia({ prefix: "/location" })
  .use(jwt({
    name: "jwt",
    secret: config.keys.jwt,
  }))
  .decorate("locCtrl", new LocationController(db))
  .decorate("geoCtrl", new GeocodingController(db))
  .decorate("authCtrl", new AuthController(db))
  .get("/info", async ({ query, locCtrl, geoCtrl, set, headers, jwt, authCtrl }) => {
    // Authentication check
    const authResult = await authenticateRequest(headers, jwt, authCtrl, set);
    if (authResult) return authResult;

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
    response: {
      200: LocationInfoResponseSchema,
      400: t.Object({
        message: t.String(),
      }),
      401: t.Object({
        message: t.String(),
      }),
      404: t.Object({
        message: t.String(),
      }),
    },
    description: "Get detailed information about location. This uses an AI model to generate information. Requires JWT authentication.",
    detail: {
      security: [{ bearerAuth: [] }]
    }
  })
  .get("/nearby", async ({ headers, jwt, authCtrl, set }) => {
    // Authentication check
    const authResult = await authenticateRequest(headers, jwt, authCtrl, set);
    if (authResult) return authResult;

    return {
      message: "Hello World",
    };
  }, {
    tags: ["location"],
    response: {
      200: t.Object({
        message: t.String(),
      }),
      401: t.Object({
        message: t.String(),
      }),
    },
    description: "Get nearby locations. Requires JWT authentication.",
    detail: {
      security: [{ bearerAuth: [] }]
    }
  })
  .get("/test-auth", async ({ headers, jwt, authCtrl, set }) => {
    // Authentication check
    const authResult = await authenticateRequest(headers, jwt, authCtrl, set);
    if (authResult) return authResult;

    return {
      message: "Authentication working!",
    };
  }, {
    tags: ["location"],
    response: {
      200: t.Object({
        message: t.String(),
      }),
      401: t.Object({
        message: t.String(),
      }),
    },
    description: "Test authentication endpoint.",
    detail: {
      security: [{ bearerAuth: [] }]
    }
  })

export default route;