import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthController } from "../../controllers/auth.controller";
import { db } from "../../db/init";
import { config } from "../../../config";
import { LoginRequestSchema, LoginResponseSchema, RegisterRequestSchema, RegisterResponseSchema } from "../../services/auth";

/**
 * Authentication routes mounted at /v1/auth
 */
const route = new Elysia({ prefix: "/auth" })
  .use(jwt({
    name: "jwt",
    secret: config.keys.jwt,
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
  });

export default route;