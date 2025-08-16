import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { InviteController } from "../controllers/invite.controller";
import { db as testDb } from "../db/init";
import { invitesTable } from "../db/schema";
import { eq } from "drizzle-orm";
import adze from "adze";

describe("InviteController", () => {
  const inviteCtrl = new InviteController(testDb);
  const testEmail = "invite-test@example.com";

  beforeEach(async () => {
    // Clean up any existing test invites
    try {
      await testDb.delete(invitesTable).where(eq(invitesTable.email, testEmail));
    } catch (error) {
      adze.ns("invite:test").error("Error cleaning up test invites", { error });
    }
  });

  afterEach(async () => {
    // Clean up test invites
    try {
      await testDb.delete(invitesTable).where(eq(invitesTable.email, testEmail));
    } catch (error) {
      adze.ns("invite:test").error("Error cleaning up test invites", { error });
    }
  });

  it("should create an invite successfully", async () => {
    const invite = await inviteCtrl.createInvite(testEmail);
    
    expect(invite.email).toBe(testEmail);
    expect(invite.code).toBeDefined();
    expect(invite.code.length).toBe(8);
    expect(invite.code).toMatch(/^[a-z0-9]+$/); // Only lowercase alphanumeric
    expect(invite.createdAt).toBeDefined();
  });

  it("should validate a correct invite code", async () => {
    const invite = await inviteCtrl.createInvite(testEmail);
    
    const isValid = await inviteCtrl.validateInvite(testEmail, invite.code);
    expect(isValid).toBe(true);
  });

  it("should validate invite code case insensitively", async () => {
    const invite = await inviteCtrl.createInvite(testEmail);
    
    const isValid = await inviteCtrl.validateInvite(testEmail, invite.code.toUpperCase());
    expect(isValid).toBe(true);
  });

  it("should reject invalid invite code", async () => {
    await inviteCtrl.createInvite(testEmail);
    
    const isValid = await inviteCtrl.validateInvite(testEmail, "invalid1");
    expect(isValid).toBe(false);
  });

  it("should reject valid code for wrong email", async () => {
    const invite = await inviteCtrl.createInvite(testEmail);
    
    const isValid = await inviteCtrl.validateInvite("wrong@email.com", invite.code);
    expect(isValid).toBe(false);
  });

  it("should throw error when creating duplicate invite", async () => {
    await inviteCtrl.createInvite(testEmail);
    
    await expect(inviteCtrl.createInvite(testEmail)).rejects.toThrow("Invite already exists for this email");
  });

  it("should get invite by email", async () => {
    const createdInvite = await inviteCtrl.createInvite(testEmail);
    
    const invite = await inviteCtrl.getInviteByEmail(testEmail);
    expect(invite).not.toBeNull();
    expect(invite!.email).toBe(testEmail);
    expect(invite!.code).toBe(createdInvite.code);
  });

  it("should return null for non-existent invite", async () => {
    const invite = await inviteCtrl.getInviteByEmail("nonexistent@email.com");
    expect(invite).toBeNull();
  });

  it("should delete invite", async () => {
    await inviteCtrl.createInvite(testEmail);
    
    // Verify it exists
    let invite = await inviteCtrl.getInviteByEmail(testEmail);
    expect(invite).not.toBeNull();
    
    // Delete it
    await inviteCtrl.deleteInvite(testEmail);
    
    // Verify it's gone
    invite = await inviteCtrl.getInviteByEmail(testEmail);
    expect(invite).toBeNull();
  });
});