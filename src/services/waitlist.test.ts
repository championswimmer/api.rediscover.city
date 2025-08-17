import { describe, it, expect } from "bun:test";
import { isValidEmail } from "./waitlist";

describe("Waitlist Service", () => {
  describe("isValidEmail", () => {
    it("should validate correct email formats", () => {
      const validEmails = [
        "user@example.com",
        "test.email@domain.co.uk",
        "user+tag@example.org",
        "firstname.lastname@company.com",
        "user123@test123.com",
        "simple@email.io",
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it("should reject invalid email formats", () => {
      const invalidEmails = [
        "invalid-email",
        "@example.com",
        "user@",
        "user@.com",
        "user..double.dot@example.com",
        "user @example.com", // space
        "user@example", // no TLD
        "",
        "user@example.",
        ".user@example.com",
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    it("should handle edge cases", () => {
      expect(isValidEmail("a@b.c")).toBe(true); // minimal valid email
      expect(isValidEmail("very.long.email.address@very.long.domain.name.com")).toBe(true);
    });
  });
});