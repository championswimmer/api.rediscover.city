import { describe, it, expect } from "bun:test";
import { InviteService } from "../services/invite";

describe("InviteService", () => {
  it("should generate 8-character alphanumeric codes", () => {
    for (let i = 0; i < 10; i++) {
      const code = InviteService.generateInviteCode();
      expect(code.length).toBe(8);
      expect(code).toMatch(/^[a-z0-9]+$/);
    }
  });

  it("should generate unique codes", () => {
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(InviteService.generateInviteCode());
    }
    // While not guaranteed, it's very unlikely to get duplicates in 100 attempts
    expect(codes.size).toBeGreaterThan(90);
  });

  it("should normalize codes to lowercase", () => {
    expect(InviteService.normalizeCode("ABC123def")).toBe("abc123def");
    expect(InviteService.normalizeCode("UPPERCASE")).toBe("uppercase");
    expect(InviteService.normalizeCode("lowercase")).toBe("lowercase");
  });

  it("should handle empty codes gracefully", () => {
    expect(InviteService.normalizeCode("")).toBe("");
    expect(InviteService.normalizeCode(null as any)).toBe("");
    expect(InviteService.normalizeCode(undefined as any)).toBe("");
  });
});