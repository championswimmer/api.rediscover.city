import { Elysia, t } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { WaitlistController } from "../../controllers/waitlist.controller";
import { db } from "../../db/init";
import {
  WaitlistRequestSchema,
  WaitlistResponseSchema,
  RateLimitErrorSchema
} from "../../services/waitlist";

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

/**
 * Waitlist routes mounted at /waitlist
 */
const route = new Elysia({ prefix: "/waitlist" })
  .use(
    rateLimit({
      max: 100, // 100 requests per minute per IP
      duration: 60000, // 60 seconds
      scoping: "global", // Rate limit per IP address
      errorResponse: "Rate limit exceeded. You can only make 100 requests per minute. Please try again later.",
      generator: ipAddressGenerator
    })
  )
  .use(
    rateLimit({
      max: 1, // 1 request per second
      duration: 1000, // 1 second
      scoping: "global", // Rate limit per IP address
      errorResponse: "Rate limit exceeded. You can only make 1 request per second. Please try again later.",
      generator: ipAddressGenerator
    })
  )
  .decorate("waitlistCtrl", new WaitlistController(db))
  .post("/", async ({ body, waitlistCtrl, set }) => {
    try {
      const { entry, created } = await waitlistCtrl.addToWaitlist(body.email);
      const alreadySubscribed = !created;

      return {
        message: alreadySubscribed
          ? "Email is already subscribed to the waitlist."
          : "Successfully added to waitlist!",
        email: body.email,
        alreadySubscribed,
      };
    } catch (error) {
      set.status = 500;
      return {
        message: "Internal server error. Please try again later.",
      };
    }
  }, {
    body: WaitlistRequestSchema,
    response: {
      200: WaitlistResponseSchema,
      429: RateLimitErrorSchema,
      500: t.Object({
        message: t.String(),
      }),
    },
    description: "Subscribe to the waitlist with an email address. Rate limited to 100 requests per minute and 1 request per second per IP address.",
    tags: ["waitlist"],
    detail: {
      security: [] // No authentication required
    }
  });

export default route;