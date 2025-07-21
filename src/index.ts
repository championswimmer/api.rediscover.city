import { Elysia } from "elysia";
import { config } from "./config";
import locate from "./routes/v1/locate";
import location from "./routes/v1/location";
import { serverTiming } from "@elysiajs/server-timing";

const app = new Elysia()
  .use(serverTiming())
  .get("/", () => "Hello Elysia")
  .mount("/v1/locate", locate)
  .mount("/v1/location", location)
  .listen(config.port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
