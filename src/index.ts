import { Elysia } from "elysia";
import { config } from "./config";
import locate from "./routes/v1/locate";
import location from "./routes/v1/location";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from '@elysiajs/swagger'

const app = new Elysia()
  .use(serverTiming())
  .use(swagger())
  .get("/", () => "api.rediscover.city")
  .use(locate)
  .use(location)
  .listen(config.port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
