import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthController } from "../../controllers/auth.controller";
import { db } from "../../db/init";
import { config } from "../../../config";
import { LoginRequestSchema, LoginResponseSchema } from "../../services/auth";

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
  });

export default route;