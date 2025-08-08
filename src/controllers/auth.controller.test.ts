import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { AuthController } from "../controllers/auth.controller";
import { db as testDb } from "../db/init";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import adze from "adze";

describe("AuthController", () => {
  const authCtrl = new AuthController(testDb);
  const testEmail = "test@example.com";
  const testPassword = "testPassword123";

  beforeEach(async () => {
    // Clean up any existing test users
    try {
      await testDb.delete(usersTable).where(eq(usersTable.email, testEmail));
    } catch (error) {
      adze.ns("auth:test").error("Error cleaning up test users", { error });
    }
  });

  afterEach(async () => {
    // Clean up test users
    try {
      await testDb.delete(usersTable).where(eq(usersTable.email, testEmail));
    } catch (error) {
      adze.ns("auth:test").error("Error cleaning up test users", { error });
    }
  });

  it("should create a user successfully", async () => {
    const user = await authCtrl.createUser(testEmail, testPassword);
    
    expect(user.email).toBe(testEmail);
    expect(user.id).toBeDefined();
    expect(user.passwordHash).toBeDefined();
    expect(user.passwordHash).toContain(":");
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  it("should login with correct credentials", async () => {
    // Create a user first
    const createdUser = await authCtrl.createUser(testEmail, testPassword);
    
    // Attempt login
    const user = await authCtrl.login(testEmail, testPassword);
    
    expect(user).not.toBeNull();
    expect(user!.id).toBe(createdUser.id);
    expect(user!.email).toBe(testEmail);
  });

  it("should fail login with incorrect password", async () => {
    // Create a user first
    await authCtrl.createUser(testEmail, testPassword);
    
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
    const createdUser = await authCtrl.createUser(testEmail, testPassword);
    
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
    await authCtrl.createUser(testEmail, testPassword);
    
    // Attempt to create another user with same email
    await expect(authCtrl.createUser(testEmail, testPassword)).rejects.toThrow("User with this email already exists");
  });
});