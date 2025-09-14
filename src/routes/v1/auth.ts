import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { oauth2 } from "elysia-oauth2";
import { AuthController } from "../../controllers/auth.controller";
import { db } from "../../db/init";
import { config } from "../../../config";
import { LoginRequestSchema, LoginResponseSchema, RegisterRequestSchema, RegisterResponseSchema, GoogleOAuthCallbackSchema } from "../../services/auth";

/**
 * Authentication routes mounted at /v1/auth
 */
const route = new Elysia({ prefix: "/auth" })
  .use(jwt({
    name: "jwt",
    secret: config.keys.jwt,
  }))
  .use(oauth2({
    Google: [
      config.keys.googleOAuthClientId,
      config.keys.googleOAuthClientSecret,
      `https://app.rediscover.city/auth/google/callback` // Frontend callback URL
    ]
  }))
  .decorate("authCtrl", new AuthController(db))
  .post("/login", async ({ body, jwt, set, authCtrl }) => {
    const user = await authCtrl.login(body.email, body.password);
    
    if (!user) {
      set.status = 401;
      return {
        message: "Invalid email or password",
      };
    }

    const token = await jwt.sign({
      userId: user.id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }, {
    body: LoginRequestSchema,
    response: {
      200: LoginResponseSchema,
      401: t.Object({
        message: t.String(),
      }),
    },
    description: "Login with email and password to get JWT token",
    tags: ["auth"],
    detail: {
      security: []
    }
  })
  .post("/register", async ({ body, jwt, set, authCtrl }) => {
    try {
      const user = await authCtrl.createUser(body.email, body.password, body.code);

      const token = await jwt.sign({
        userId: user.id,
        email: user.email,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch (error) {
      if (error instanceof Error && error.message === "User with this email already exists") {
        set.status = 409;
        return {
          message: "User with this email already exists",
        };
      }
      
      if (error instanceof Error && error.message === "Invalid invite code for this email") {
        set.status = 400;
        return {
          message: "Invalid invite code for this email",
        };
      }
      
      set.status = 500;
      return {
        message: "Internal server error",
      };
    }
  }, {
    body: RegisterRequestSchema,
    response: {
      200: RegisterResponseSchema,
      400: t.Object({
        message: t.String(),
      }),
      409: t.Object({
        message: t.String(),
      }),
      500: t.Object({
        message: t.String(),
      }),
    },
    description: "Register a new user account with invite code and get JWT token",
    tags: ["auth"],
    detail: {
      security: []
    }
  })
  .get("/google", ({ oauth2 }) => {
    // Redirect to Google OAuth
    return oauth2.redirect("Google", ["email", "profile"]);
  }, {
    description: "Redirect to Google OAuth for authentication",
    tags: ["auth"],
    detail: {
      security: []
    }
  })
  .post("/google", async ({ body, oauth2, jwt, set, authCtrl }) => {
    try {
      // Get Google OAuth tokens
      const tokens = await oauth2.authorize("Google");
      const accessToken = tokens.accessToken();

      // Get user info from Google
      const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        set.status = 400;
        return {
          message: "Failed to get user info from Google",
        };
      }

      const googleUser = await response.json();
      
      if (!googleUser.email || !googleUser.id) {
        set.status = 400;
        return {
          message: "Invalid Google user data",
        };
      }

      // Create or get user from database
      const user = await authCtrl.createOrGetGoogleUser(
        googleUser.email,
        googleUser.id,
        accessToken
      );

      // Create JWT token
      const token = await jwt.sign({
        userId: user.id,
        email: user.email,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch (error) {
      console.error("Google OAuth error:", error);
      set.status = 500;
      return {
        message: "Internal server error during Google authentication",
      };
    }
  }, {
    body: GoogleOAuthCallbackSchema,
    response: {
      200: LoginResponseSchema,
      400: t.Object({
        message: t.String(),
      }),
      500: t.Object({
        message: t.String(),
      }),
    },
    description: "Complete Google OAuth flow and get JWT token",
    tags: ["auth"],
    detail: {
      security: []
    }
  });

export default route;