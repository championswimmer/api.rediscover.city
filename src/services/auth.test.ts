import { describe, it, expect, beforeEach } from "bun:test";
import { AuthService } from "./auth";

describe("AuthService", () => {
  describe("hashPassword", () => {
    it("should hash a password and return salt:hash format", () => {
      const password = "testPassword123";
      const hash = AuthService.hashPassword(password);
      
      expect(hash).toContain(":");
      const [salt, hashPart] = hash.split(":");
      expect(salt).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(hashPart).toHaveLength(128); // 64 bytes = 128 hex chars
    });

    it("should generate different hashes for the same password", () => {
      const password = "testPassword123";
      const hash1 = AuthService.hashPassword(password);
      const hash2 = AuthService.hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("should verify correct password", () => {
      const password = "testPassword123";
      const hash = AuthService.hashPassword(password);
      
      expect(AuthService.verifyPassword(password, hash)).toBe(true);
    });

    it("should reject incorrect password", () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword";
      const hash = AuthService.hashPassword(password);
      
      expect(AuthService.verifyPassword(wrongPassword, hash)).toBe(false);
    });

    it("should reject malformed hash", () => {
      const password = "testPassword123";
      const malformedHash = "invalidhash";
      
      expect(AuthService.verifyPassword(password, malformedHash)).toBe(false);
    });

    it("should reject hash without colon separator", () => {
      const password = "testPassword123";
      const malformedHash = "salthashwithoutcolon";
      
      expect(AuthService.verifyPassword(password, malformedHash)).toBe(false);
    });
  });
});