import { describe, it, expect, beforeAll } from "bun:test";
import { Elysia } from "elysia";
import authRoutes from "./auth";

describe("Google OAuth Routes", () => {
  let app: Elysia;

  beforeAll(() => {
    app = new Elysia().use(authRoutes);
  });

  it("should handle GET /auth/google redirect request", async () => {
    const response = await app
      .handle(new Request("http://localhost/auth/google"))
      .then(res => res);
    
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toContain("accounts.google.com");
  });

  it("should handle POST /auth/google with missing code", async () => {
    const response = await app
      .handle(new Request("http://localhost/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      }))
      .then(res => res);
    
    expect(response.status).toBe(422); // Validation error for missing code
  });

  it("should handle POST /auth/google with valid request structure", async () => {
    const response = await app
      .handle(new Request("http://localhost/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "test-auth-code" })
      }))
      .then(res => res);
    
    // Should fail due to missing OAuth credentials but structure should be valid
    expect(response.status).toBe(500);
    
    const body = await response.json();
    expect(body.message).toBe("Internal server error during Google authentication");
  });
});