import { Elysia } from "elysia";

/**
 * route mounted at /v1/location
 */

const route = new Elysia()
 .get("/info", () => {
  return {
    message: "Hello World",
  };
 })
 .get("/nearby", () => {
  return {
    message: "Hello World",
  };
 })

export default route;