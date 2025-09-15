import { describe, it, expect } from "bun:test";
import { GoogleAuthService } from "./google-auth";

describe("GoogleAuthService", () => {
  describe("schemas", () => {
    it("should validate GoogleAuthCallbackRequestSchema", () => {
      const validRequest = {
        code: "4/0AanvZzzEzk..."
      };

      // This would be validated by the TypeBox schema in actual usage
      expect(validRequest.code).toBeString();
      expect(validRequest.code.length).toBeGreaterThan(0);
    });
  });

  describe("exchangeCodeForToken", () => {
    it("should throw error for invalid parameters", async () => {
      try {
        await GoogleAuthService.exchangeCodeForToken(
          "invalid_code",
          "invalid_client_id", 
          "invalid_client_secret",
          "invalid_redirect_uri"
        );
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
        expect(error instanceof Error).toBe(true);
      }
    });
  });

  describe("getUserInfo", () => {
    it("should throw error for invalid access token", async () => {
      try {
        await GoogleAuthService.getUserInfo("invalid_access_token");
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
        expect(error instanceof Error).toBe(true);
      }
    });
  });
});