import { describe, it, expect } from "bun:test";
import { WaitlistRequestSchema, WaitlistResponseSchema } from "./waitlist";

describe("Waitlist Service", () => {
  describe("WaitlistRequestSchema", () => {
    it("should define email field with email format", () => {
      expect(WaitlistRequestSchema.properties.email.format).toBe("email");
      expect(WaitlistRequestSchema.properties.email.type).toBe("string");
    });

    it("should have proper schema structure for requests", () => {
      expect(WaitlistRequestSchema.type).toBe("object");
      expect(WaitlistRequestSchema.properties).toBeDefined();
      expect(WaitlistRequestSchema.properties.email).toBeDefined();
    });
  });

  describe("WaitlistResponseSchema", () => {
    it("should have proper response schema structure", () => {
      expect(WaitlistResponseSchema.type).toBe("object");
      expect(WaitlistResponseSchema.properties.message).toBeDefined();
      expect(WaitlistResponseSchema.properties.email).toBeDefined();
      expect(WaitlistResponseSchema.properties.alreadySubscribed).toBeDefined();
    });

    it("should define email field with email format in response", () => {
      expect(WaitlistResponseSchema.properties.email.format).toBe("email");
      expect(WaitlistResponseSchema.properties.email.type).toBe("string");
    });
  });
});