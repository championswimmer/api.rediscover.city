import { Elysia } from "elysia";
import { rateLimit } from "elysia-rate-limit";
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
import './services/posthog'

setupLogger({
  withEmoji: config.logs.emoji,
  showTimestamp: true,
  format: 'pretty',
  activeLevel: config.logs.level,
});

/**
 * Extracted IP address generator function to avoid duplication
 */
const ipAddressGenerator = (request: Request) => {
  // Prefer X-Forwarded-For when behind a proxy
  return request.headers.get('x-forwarded-for')?.split(',')[0]
    || request.headers.get('cf-connecting-ip')
    || request.headers.get('x-real-ip')
    || 'unknown'
};

const app = new Elysia()
  .use(cors(config.cors))
  .use(serverTiming())
  .use(swagger(config.swaggerConfig))
  .use(
    rateLimit({
      max: 200, // 200 requests per minute per IP
      duration: 60000, // 60 seconds
      scoping: "global", // Rate limit per IP address
      errorResponse: "Rate limit exceeded. You can only make 200 requests per minute. Please try again later.",
      generator: ipAddressGenerator
    })
  )
  .use(
    rateLimit({
      max: 5, // 5 requests per second per IP
      duration: 1000, // 1 second
      scoping: "global", // Rate limit per IP address
      errorResponse: "Rate limit exceeded. You can only make 5 requests per second. Please try again later.",
      generator: ipAddressGenerator
    })
  )
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
