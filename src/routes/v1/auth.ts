import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthController } from "../../controllers/auth.controller";
import { GoogleAuthController } from "../../controllers/google-auth.controller";
import { db } from "../../db/init";
import { config } from "../../../config";
import { LoginRequestSchema, LoginResponseSchema, RegisterRequestSchema, RegisterResponseSchema } from "../../services/auth";
import { GoogleAuthCallbackRequestSchema, GoogleAuthResponseSchema, GoogleAuthService } from "../../services/google-auth";
import adze from "adze";

/**
 * Authentication routes mounted at /v1/auth
 */
const route = new Elysia({ prefix: "/auth" })
  .use(jwt({
    name: "jwt",
    secret: config.keys.jwt,
  }))
  .decorate("authCtrl", new AuthController(db))
  .decorate("googleAuthCtrl", new GoogleAuthController(db))
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
  .get("/google", async ({ set }) => {
    // Redirect to Google OAuth
    adze.info("Initiating Google OAuth flow");
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
      client_id: config.keys.googleOAuth.clientId,
      redirect_uri: "https://app.rediscover.city/auth/google/callback",
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent"
    }).toString();
    
    set.status = 302;
    set.headers.location = authUrl;
    return;
  }, {
    response: {
      302: t.Void(),
    },
    description: "Redirect to Google OAuth for authentication",
    tags: ["auth"],
    detail: {
      security: []
    }
  })
  .post("/google", async ({ body, jwt, set, googleAuthCtrl }) => {
    try {
      adze.info("Processing Google OAuth callback", { hasCode: !!body.code });

      // Exchange code for tokens
      const tokenData = await GoogleAuthService.exchangeCodeForToken(
        body.code,
        config.keys.googleOAuth.clientId,
        config.keys.googleOAuth.clientSecret,
        "https://app.rediscover.city/auth/google/callback"
      );

      // Get user info from Google
      const googleUserData = await GoogleAuthService.getUserInfo(tokenData.access_token);

      // Find or create user
      const { user } = await googleAuthCtrl.findOrCreateUserFromGoogle(googleUserData, tokenData);

      // Create JWT token
      const token = await jwt.sign({
        userId: user.id,
        email: user.email,
      });

      adze.info("Google OAuth login successful", { userId: user.id, email: user.email });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch (error) {
      adze.error("Google OAuth error", { error: error instanceof Error ? error.message : String(error) });
      
      set.status = 400;
      return {
        message: "Google authentication failed",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }, {
    body: GoogleAuthCallbackRequestSchema,
    response: {
      200: GoogleAuthResponseSchema,
      400: t.Object({
        message: t.String(),
        error: t.Optional(t.String()),
      }),
    },
    description: "Process Google OAuth callback and return JWT token",
    tags: ["auth"],
    detail: {
      security: []
    }
  });

export default route;