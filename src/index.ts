import { Elysia } from "elysia";
import { config } from "./config";
import locate from "./routes/v1/locate";
import location from "./routes/v1/location";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from '@elysiajs/swagger'
import { db as _db } from "./db/init";

const app = new Elysia()
  .use(serverTiming())
  .use(swagger(config.swaggerConfig))
  .group("/v1", (app) => app
    .use(locate)
    .use(location)
  )
  .listen(config.port);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
