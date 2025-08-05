import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthController } from "../controllers/auth.controller";
import { db } from "../db/init";
import { config } from "../../config";

/**
 * JWT Authentication plugin
 * Validates JWT token and protects routes
 */
export const authPlugin = () => new Elysia({ name: "auth-plugin" })
  .use(jwt({
    name: "jwt",
    secret: config.keys.jwt,
  }))
  .decorate("authCtrl", new AuthController(db))
  .onBeforeHandle(async ({ headers, jwt, authCtrl, set }) => {
    console.log("AUTH MIDDLEWARE CALLED");
    const authorization = headers.authorization;
    
    if (!authorization) {
      console.log("NO AUTH HEADER");
      set.status = 401;
      return {
        message: "Authorization header required",
      };
    }

    const token = authorization.startsWith("Bearer ")
      ? authorization.substring(7)
      : authorization;

    try {
      const payload = await jwt.verify(token);
      
      if (!payload || typeof payload !== "object" || !payload.userId) {
        console.log("INVALID TOKEN PAYLOAD");
        set.status = 401;
        return {
          message: "Invalid token",
        };
      }

      const user = await authCtrl.getUserById(payload.userId);
      
      if (!user) {
        console.log("USER NOT FOUND");
        set.status = 401;
        return {
          message: "User not found",
        };
      }

      console.log("AUTH SUCCESS");
      // Authentication successful - let the request continue
    } catch (error) {
      console.log("AUTH ERROR:", error);
      set.status = 401;
      return {
        message: "Invalid or expired token",
      };
    }
  });