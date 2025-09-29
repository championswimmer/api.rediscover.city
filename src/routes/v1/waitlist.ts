import { Elysia, t } from "elysia";
import { WaitlistController } from "../../controllers/waitlist.controller";
import { db } from "../../db/init";
import {
  WaitlistRequestSchema,
  WaitlistResponseSchema,
  RateLimitErrorSchema
} from "../../services/waitlist";

/**
 * Waitlist routes mounted at /waitlist
 */
const route = new Elysia({ prefix: "/waitlist" })
  .decorate("waitlistCtrl", new WaitlistController(db))
  .post("/", async ({ body, waitlistCtrl, set }) => {
    try {
      const { created } = await waitlistCtrl.addToWaitlist(body.email);
      const alreadySubscribed = !created;

      return {
        message: alreadySubscribed
          ? "Email is already subscribed to the waitlist."
          : "Successfully added to waitlist!",
        email: body.email,
        alreadySubscribed,
      };
    } catch {
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
    description: "Subscribe to the waitlist with an email address.",
    tags: ["waitlist"],
    detail: {
      security: [] // No authentication required
    }
  });

export default route;