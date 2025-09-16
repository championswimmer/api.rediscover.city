import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthController } from "../../controllers/auth.controller";
import { db } from "../../db/init";
import { config } from "../../../config";
import { LoginRequestSchema, LoginResponseSchema, RegisterRequestSchema, RegisterResponseSchema } from "../../services/auth";
import path from "path";
import { ip } from "elysia-ip";
import { createHash } from "crypto";
import { oauth2 } from "elysia-oauth2";

/**
 * Authentication routes mounted at /v1/auth
 */
const route = new Elysia({ prefix: "/auth" })
  .use(jwt({
    name: "jwt",
    secret: config.keys.jwt,
  }))
  .use(ip())
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
  .use(
    oauth2({
      Google: [
        config.oauth.google.clientId,
        config.oauth.google.clientSecret,
        new URL("auth/google/callback", config.baseUrls.app).toString(),
      ],
    })
  )
  .get("/google", async ({ oauth2 }) => oauth2.redirect("Google", ["openid", "email", "profile"]), {
    description: "Redirect to Google OAuth2 login",
    tags: ["auth"],
    detail: {
      security: []
    }
  })
  .post("/google", async ({ oauth2, jwt, set, ip, body, query, authCtrl }) => {
    query.code = body.code || query.code;
    query.state = body.state || query.state;
    const tokens = await oauth2.authorize("Google");
    
    type GoogleUserInfo = {
      sub: string;
      name: string;
      picture: string;
      email: string;
    }

    const userInfo: GoogleUserInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    }).then(res => res.json());

    if (!userInfo.email) {
      set.status = 400;
      return {
        message: "Failed to retrieve email from Google",
      };
    }

    const user = await authCtrl.getOrCreateUserWithGoogle(
      userInfo.sub,
      userInfo.email,
      userInfo.name,
      userInfo.picture,
      tokens.accessToken(),
      tokens.refreshToken()
    )
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
    }
  }, {
    body: t.Object({
      code: t.String(),
      state: t.Optional(t.String()),
    }),
    response: {
      200: RegisterResponseSchema,
      400: t.Object({
        message: t.String(),
      }),
      500: t.Object({
        message: t.String(),
      }),
    },
    description: "Google OAuth2 callback endpoint",
    tags: ["auth"],
    detail: {
      security: []
    }
  })

export default route;