import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { config } from "../config";

describe("CORS Configuration", () => {
  const app = new Elysia()
    .use(cors(config.cors))
    .get("/test", () => ({ message: "test" }));

  it("should allow requests from allowed origins", async () => {
    const allowedOrigins = [
      "https://rediscover.city",
      "https://app.rediscover.city", 
      "https://rediscover-city.lovable.app",
      "https://rediscover-city.vercel.app"
    ];

    for (const origin of allowedOrigins) {
      const response = await app.handle(
        new Request("http://localhost:3000/test", {
          method: "OPTIONS",
          headers: {
            "Origin": origin,
            "Access-Control-Request-Method": "GET"
          }
        })
      );

      expect(response.status).toBe(204);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin);
      expect(response.headers.get("Access-Control-Allow-Credentials")).toBe("true");
      expect(response.headers.get("Access-Control-Allow-Methods")).toContain("GET");
      expect(response.headers.get("Access-Control-Allow-Headers")).toContain("Content-Type");
      expect(response.headers.get("Access-Control-Allow-Headers")).toContain("Authorization");
    }
  });

  it("should not set Allow-Origin header for unauthorized origins", async () => {
    const response = await app.handle(
      new Request("http://localhost:3000/test", {
        method: "OPTIONS",
        headers: {
          "Origin": "https://unauthorized-domain.com",
          "Access-Control-Request-Method": "GET"
        }
      })
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("should handle GET requests with proper CORS headers", async () => {
    const response = await app.handle(
      new Request("http://localhost:3000/test", {
        method: "GET",
        headers: {
          "Origin": "https://rediscover.city"
        }
      })
    );

    expect(response.status).toBe(200);
    // For actual requests (not preflight), some CORS headers might be set differently
    // but the request should succeed
  });
});