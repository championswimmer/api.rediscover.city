import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { GoogleAuthController } from "./google-auth.controller";
import { db } from "../db/init";
import { googleAuthsTable, usersTable } from "../db/schema";
import { eq } from "drizzle-orm";

describe("GoogleAuthController", () => {
  let googleAuthCtrl: GoogleAuthController;
  const testEmail = "test@example.com";
  const testGoogleId = "123456789";

  beforeAll(async () => {
    googleAuthCtrl = new GoogleAuthController(db);
    
    // Clean up any existing test data
    await db.delete(googleAuthsTable).where(eq(googleAuthsTable.email, testEmail));
    await db.delete(usersTable).where(eq(usersTable.email, testEmail));
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(googleAuthsTable).where(eq(googleAuthsTable.email, testEmail));
    await db.delete(usersTable).where(eq(usersTable.email, testEmail));
  });

  describe("findOrCreateUserFromGoogle", () => {
    it("should create a new user when Google user doesn't exist", async () => {
      const googleData = {
        id: testGoogleId,
        email: testEmail,
        name: "Test User",
        picture: "https://example.com/photo.jpg"
      };

      const tokenData = {
        access_token: "access_token_123",
        refresh_token: "refresh_token_123"
      };

      const result = await googleAuthCtrl.findOrCreateUserFromGoogle(googleData, tokenData);

      expect(result.isNewUser).toBe(true);
      expect(result.user.email).toBe(testEmail);
      expect(result.user.id).toBeDefined();

      // Verify Google auth record was created
      const googleAuth = await googleAuthCtrl.getGoogleAuthByUserId(result.user.id);
      expect(googleAuth).toBeDefined();
      expect(googleAuth!.googleId).toBe(testGoogleId);
      expect(googleAuth!.email).toBe(testEmail);
      expect(googleAuth!.name).toBe("Test User");
    });

    it("should return existing user when Google auth already exists", async () => {
      const googleData = {
        id: testGoogleId,
        email: testEmail,
        name: "Test User Updated",
        picture: "https://example.com/photo2.jpg"
      };

      const tokenData = {
        access_token: "new_access_token_123",
        refresh_token: "new_refresh_token_123"
      };

      const result = await googleAuthCtrl.findOrCreateUserFromGoogle(googleData, tokenData);

      expect(result.isNewUser).toBe(false);
      expect(result.user.email).toBe(testEmail);

      // Verify tokens were updated
      const googleAuth = await googleAuthCtrl.getGoogleAuthByUserId(result.user.id);
      expect(googleAuth!.accessToken).toBe("new_access_token_123");
      expect(googleAuth!.refreshToken).toBe("new_refresh_token_123");
    });
  });

  describe("getGoogleAuthByUserId", () => {
    it("should return null for non-existent user", async () => {
      // Use a valid UUID format for the test
      const fakeUuid = "550e8400-e29b-41d4-a716-446655440000";
      const result = await googleAuthCtrl.getGoogleAuthByUserId(fakeUuid);
      expect(result).toBeNull();
    });
  });

  describe("deleteGoogleAuth", () => {
    it("should delete Google auth record", async () => {
      // Get the user ID from previous test
      const users = await db.select().from(usersTable).where(eq(usersTable.email, testEmail)).limit(1);
      const userId = users[0]?.id;

      if (userId) {
        await googleAuthCtrl.deleteGoogleAuth(userId);
        const googleAuth = await googleAuthCtrl.getGoogleAuthByUserId(userId);
        expect(googleAuth).toBeNull();
      }
    });
  });
});