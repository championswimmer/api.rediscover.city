import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { AuthController } from "../controllers/auth.controller";
import { InviteController } from "../controllers/invite.controller";
import { db as testDb } from "../db/init";
import { usersTable, invitesTable } from "../db/schema";
import { eq } from "drizzle-orm";
import adze from "adze";

describe("AuthController", () => {
  const authCtrl = new AuthController(testDb);
  const inviteCtrl = new InviteController(testDb);
  const testEmail = "test@example.com";
  const testPassword = "testPassword123";
  let testInviteCode: string;

  beforeEach(async () => {
    // Clean up any existing test users and invites
    try {
      await testDb.delete(usersTable).where(eq(usersTable.email, testEmail));
      await testDb.delete(invitesTable).where(eq(invitesTable.email, testEmail));
    } catch (error) {
      adze.ns("auth:test").error("Error cleaning up test data", { error });
    }

    // Create a test invite
    try {
      const invite = await inviteCtrl.createInvite(testEmail);
      testInviteCode = invite.code;
    } catch (error) {
      adze.ns("auth:test").error("Error creating test invite", { error });
    }
  });

  afterEach(async () => {
    // Clean up test data
    try {
      await testDb.delete(usersTable).where(eq(usersTable.email, testEmail));
      await testDb.delete(invitesTable).where(eq(invitesTable.email, testEmail));
    } catch (error) {
      adze.ns("auth:test").error("Error cleaning up test data", { error });
    }
  });

  it("should create a user successfully", async () => {
    const user = await authCtrl.createUser(testEmail, testPassword, testInviteCode);
    
    expect(user.email).toBe(testEmail);
    expect(user.id).toBeDefined();
    expect(user.passwordHash).toBeDefined();
    expect(user.passwordHash).toContain(":");
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  it("should login with correct credentials", async () => {
    // Create a user first
    const createdUser = await authCtrl.createUser(testEmail, testPassword, testInviteCode);
    
    // Attempt login
    const user = await authCtrl.login(testEmail, testPassword);
    
    expect(user).not.toBeNull();
    expect(user!.id).toBe(createdUser.id);
    expect(user!.email).toBe(testEmail);
  });

  it("should fail login with incorrect password", async () => {
    // Create a user first
    await authCtrl.createUser(testEmail, testPassword, testInviteCode);
    
    // Attempt login with wrong password
    const user = await authCtrl.login(testEmail, "wrongPassword");
    
    expect(user).toBeNull();
  });

  it("should fail login with non-existent email", async () => {
    // Attempt login with non-existent email
    const user = await authCtrl.login("nonexistent@example.com", testPassword);
    
    expect(user).toBeNull();
  });

  it("should get user by ID", async () => {
    // Create a user first
    const createdUser = await authCtrl.createUser(testEmail, testPassword, testInviteCode);
    
    // Get user by ID
    const user = await authCtrl.getUserById(createdUser.id);
    
    expect(user).not.toBeNull();
    expect(user!.id).toBe(createdUser.id);
    expect(user!.email).toBe(testEmail);
  });

  it("should return null for non-existent user ID", async () => {
    // Get user by non-existent ID
    const user = await authCtrl.getUserById("00000000-0000-0000-0000-000000000000");
    
    expect(user).toBeNull();
  });

  it("should throw error when creating user with duplicate email", async () => {
    // Create a user first
    await authCtrl.createUser(testEmail, testPassword, testInviteCode);
    
    // Create another invite for a different email to test the duplicate user scenario
    const differentEmail = "different@example.com";
    const differentInvite = await inviteCtrl.createInvite(differentEmail);
    
    // Attempt to create another user with same email (but different invite for different email should still fail)
    await expect(authCtrl.createUser(testEmail, testPassword, differentInvite.code)).rejects.toThrow("User with this email already exists");
    
    // Clean up the different invite
    await inviteCtrl.deleteInvite(differentEmail);
  });

  it("should throw error when creating user with invalid invite code", async () => {
    // Attempt to create user with invalid invite code
    await expect(authCtrl.createUser(testEmail, testPassword, "invalid1")).rejects.toThrow("Invalid invite code for this email");
  });

  it("should throw error when creating user with correct code but wrong email", async () => {
    // Attempt to create user with valid code but wrong email
    await expect(authCtrl.createUser("wrong@email.com", testPassword, testInviteCode)).rejects.toThrow("Invalid invite code for this email");
  });

  describe("authenticateRequest", () => {
    let testUser: UserModel;

    beforeEach(async () => {
      // Create a test user for authentication tests
      testUser = await authCtrl.createUser(testEmail, testPassword, testInviteCode);
    });

    it("should return error when no authorization header is provided", async () => {
      const headers = {};
      const mockJwt = { 
        verify: () => Promise.resolve({}) 
      };
      const mockSet = { status: undefined };

      const result = await authCtrl.authenticateRequest(headers, mockJwt, mockSet);

      expect(result.error).toEqual({ message: "Authorization header required" });
      expect(mockSet.status).toBe(401);
    });

    it("should return error when JWT verification fails", async () => {
      const headers = { authorization: "Bearer invalid-token" };
      const mockJwt = { 
        verify: () => Promise.reject(new Error("Invalid token")) 
      };
      const mockSet = { status: undefined };

      const result = await authCtrl.authenticateRequest(headers, mockJwt, mockSet);

      expect(result.error).toEqual({ message: "Invalid or expired token" });
      expect(mockSet.status).toBe(401);
    });

    it("should return error when JWT payload is invalid", async () => {
      const headers = { authorization: "Bearer valid-token" };
      const mockJwt = { 
        verify: () => Promise.resolve({ invalidPayload: true }) 
      };
      const mockSet = { status: undefined };

      const result = await authCtrl.authenticateRequest(headers, mockJwt, mockSet);

      expect(result.error).toEqual({ message: "Invalid token" });
      expect(mockSet.status).toBe(401);
    });

    it("should return error when user is not found", async () => {
      const headers = { authorization: "Bearer valid-token" };
      const mockJwt = { 
        verify: () => Promise.resolve({ userId: "nonexistent-user-id" }) 
      };
      const mockSet = { status: undefined };

      // Temporarily mock getUserById to return null for non-existent user
      const originalGetUserById = authCtrl.getUserById;
      authCtrl.getUserById = async (id: string) => {
        if (id === "nonexistent-user-id") return null;
        return originalGetUserById.call(authCtrl, id);
      };

      const result = await authCtrl.authenticateRequest(headers, mockJwt, mockSet);

      // Restore original method
      authCtrl.getUserById = originalGetUserById;

      expect(result.error).toEqual({ message: "User not found" });
      expect(mockSet.status).toBe(401);
    });

    it("should return user when authentication is successful", async () => {
      const headers = { authorization: "Bearer valid-token" };
      const mockJwt = { 
        verify: () => Promise.resolve({ userId: testUser.id }) 
      };
      const mockSet = { status: undefined };

      const result = await authCtrl.authenticateRequest(headers, mockJwt, mockSet);

      expect(result.user).toBeDefined();
      expect(result.user!.id).toBe(testUser.id);
      expect(result.user!.email).toBe(testEmail);
      expect(result.error).toBeUndefined();
      expect(mockSet.status).toBeUndefined();
    });

    it("should handle authorization header without Bearer prefix", async () => {
      const headers = { authorization: "valid-token" };
      const mockJwt = { 
        verify: () => Promise.resolve({ userId: testUser.id }) 
      };
      const mockSet = { status: undefined };

      const result = await authCtrl.authenticateRequest(headers, mockJwt, mockSet);

      expect(result.user).toBeDefined();
      expect(result.user!.id).toBe(testUser.id);
    });
  });

  describe("Google OAuth", () => {
    const googleTestEmail = "google@test.example.com";
    const googleTestId = "google-123456789";
    const googleTestAccessToken = "google-access-token-123";

    afterEach(async () => {
      // Clean up test data
      try {
        await testDb.delete(usersTable).where(eq(usersTable.email, googleTestEmail));
      } catch (error) {
        adze.ns("auth:test").error("Error cleaning up Google OAuth test data", { error });
      }
    });

    it("should create a new user from Google OAuth", async () => {
      const user = await authCtrl.createOrGetGoogleUser(
        googleTestEmail, 
        googleTestId, 
        googleTestAccessToken
      );
      
      expect(user.email).toBe(googleTestEmail);
      expect(user.googleId).toBe(googleTestId);
      expect(user.googleAccessToken).toBe(googleTestAccessToken);
      expect(user.passwordHash).toBeNull();
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it("should update existing user with Google OAuth data", async () => {
      // First create a user
      const firstUser = await authCtrl.createOrGetGoogleUser(
        googleTestEmail, 
        googleTestId, 
        googleTestAccessToken
      );

      // Call again with updated access token
      const newAccessToken = "new-google-access-token-456";
      const updatedUser = await authCtrl.createOrGetGoogleUser(
        googleTestEmail, 
        googleTestId, 
        newAccessToken
      );

      expect(updatedUser.id).toBe(firstUser.id);
      expect(updatedUser.email).toBe(googleTestEmail);
      expect(updatedUser.googleId).toBe(googleTestId);
      expect(updatedUser.googleAccessToken).toBe(newAccessToken);
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(firstUser.updatedAt.getTime());
    });

    it("should get user by Google ID", async () => {
      // Create a user first
      await authCtrl.createOrGetGoogleUser(
        googleTestEmail, 
        googleTestId, 
        googleTestAccessToken
      );

      const user = await authCtrl.getUserByGoogleId(googleTestId);
      
      expect(user).not.toBeNull();
      expect(user!.email).toBe(googleTestEmail);
      expect(user!.googleId).toBe(googleTestId);
      expect(user!.googleAccessToken).toBe(googleTestAccessToken);
    });

    it("should return null for non-existent Google ID", async () => {
      const user = await authCtrl.getUserByGoogleId("non-existent-google-id");
      
      expect(user).toBeNull();
    });

    it("should prevent OAuth user from logging in with password", async () => {
      // Create a Google OAuth user (no password)
      await authCtrl.createOrGetGoogleUser(
        googleTestEmail, 
        googleTestId, 
        googleTestAccessToken
      );

      // Try to login with password
      const loginResult = await authCtrl.login(googleTestEmail, "some-password");
      
      expect(loginResult).toBeNull();
    });
  });
});