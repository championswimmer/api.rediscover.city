import { Elysia } from "elysia";

/**
 * route mounted at /v1/locate
 */
const route = new Elysia()
  .get("/", () => {
    return {
      message: "Hello World",
    };
  });

export default route;