import { Static, Type } from "@sinclair/typebox";

/**
 * Schema for waitlist subscription request
 */
export const WaitlistRequestSchema = Type.Object({
  email: Type.String({ 
    format: "email",
    description: "Valid email address to add to waitlist",
    examples: ["user@example.com", "newsletter@company.com"]
  }),
});

/**
 * Schema for waitlist subscription response
 */
export const WaitlistResponseSchema = Type.Object({
  message: Type.String({ description: "Success message" }),
  email: Type.String({ format: "email", description: "Email that was added to waitlist" }),
  alreadySubscribed: Type.Boolean({ description: "Whether this email was already in the waitlist" }),
});

/**
 * Schema for rate limit error response
 */
export const RateLimitErrorSchema = Type.Object({
  message: Type.String({ description: "Error message indicating rate limit exceeded" }),
  retryAfter: Type.Optional(Type.Number({ description: "Seconds to wait before retrying" })),
});

export type WaitlistRequest = Static<typeof WaitlistRequestSchema>;
export type WaitlistResponse = Static<typeof WaitlistResponseSchema>;
export type RateLimitError = Static<typeof RateLimitErrorSchema>;

/**
 * Validate email format using a more strict regex
 */
export function isValidEmail(email: string): boolean {
  // Check basic format first
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  
  // Additional checks
  return emailRegex.test(email) 
    && !email.startsWith('.') 
    && !email.endsWith('.') 
    && !email.includes('..')
    && !email.includes(' ')
    && email.split('@')[1]?.includes('.'); // Must have a TLD
}