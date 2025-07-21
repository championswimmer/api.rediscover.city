import { Elysia } from "elysia";

/**
 * route mounted at /v1/location
 */

const route = new Elysia({ prefix: "/location" })
  .get("/info", () => {
    return {
      message: "Hello World",
    };
  }, {
    tags: ["location"]
  })
  .get("/nearby", () => {
    return {
      message: "Hello World",
    };
  }, {
    tags: ["location"]
  })

export default route;