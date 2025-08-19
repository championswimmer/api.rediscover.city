import { Elysia } from "elysia";
import { config } from "../config";
import locate from "./routes/v1/locate";
import location from "./routes/v1/location";
import auth from "./routes/v1/auth";
import waitlist from "./routes/v1/waitlist";
import cities from "./routes/v1/cities";
import { serverTiming } from "@elysiajs/server-timing";
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { db as _db } from "./db/init";
import { setup as setupLogger } from "adze"; 

setupLogger({
  withEmoji: config.logs.emoji,
  showTimestamp: true,
  format: 'pretty',
  activeLevel: config.logs.level,
});

const app = new Elysia()
  .use(cors(config.cors))
  .use(serverTiming())
  .use(swagger(config.swaggerConfig))
  .use(waitlist)
  .group("/v1", (app) => app
    .use(auth)
    .use(cities)
    .use(locate)
    .use(location)
  )
  .listen(config.port);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
