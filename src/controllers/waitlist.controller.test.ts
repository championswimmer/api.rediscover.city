import { describe, it, expect, beforeEach } from "bun:test";
import { db } from "../db/init";
import { WaitlistController } from "./waitlist.controller";
import { waitlistTable } from "../db/schema";
import { eq } from "drizzle-orm";

describe("WaitlistController", () => {
  let waitlistCtrl: WaitlistController;
  const testEmail = "waitlist-test@example.com";
  const testEmail2 = "waitlist-test2@example.com";

  beforeEach(async () => {
    waitlistCtrl = new WaitlistController(db);
    
    // Clean up any existing test data
    try {
      await db.delete(waitlistTable).where(eq(waitlistTable.email, testEmail));
      await db.delete(waitlistTable).where(eq(waitlistTable.email, testEmail2));
    } catch (error) {
      // Ignore errors if table doesn't exist yet
    }
  });

  it("should add an email to the waitlist successfully", async () => {
    const entry = await waitlistCtrl.addToWaitlist(testEmail);
    
    expect(entry.email).toBe(testEmail);
    expect(entry.id).toBeDefined();
    expect(entry.createdAt).toBeDefined();
    expect(entry.createdAt).toBeInstanceOf(Date);
  });

  it("should return existing entry when email already exists", async () => {
    // Add email first time
    const firstEntry = await waitlistCtrl.addToWaitlist(testEmail);
    
    // Add same email again
    const secondEntry = await waitlistCtrl.addToWaitlist(testEmail);
    
    expect(firstEntry.id).toBe(secondEntry.id);
    expect(firstEntry.email).toBe(secondEntry.email);
    expect(firstEntry.createdAt).toEqual(secondEntry.createdAt);
  });

  it("should check if email exists in waitlist", async () => {
    // Should not exist initially
    let exists = await waitlistCtrl.isEmailInWaitlist(testEmail);
    expect(exists).toBe(false);
    
    // Add to waitlist
    await waitlistCtrl.addToWaitlist(testEmail);
    
    // Should exist now
    exists = await waitlistCtrl.isEmailInWaitlist(testEmail);
    expect(exists).toBe(true);
    
    // Different email should not exist
    exists = await waitlistCtrl.isEmailInWaitlist(testEmail2);
    expect(exists).toBe(false);
  });

  it("should get waitlist entry by email", async () => {
    // Should return null for non-existent email
    let entry = await waitlistCtrl.getWaitlistEntry(testEmail);
    expect(entry).toBeNull();
    
    // Add to waitlist
    const addedEntry = await waitlistCtrl.addToWaitlist(testEmail);
    
    // Should return the entry
    entry = await waitlistCtrl.getWaitlistEntry(testEmail);
    expect(entry).not.toBeNull();
    expect(entry!.id).toBe(addedEntry.id);
    expect(entry!.email).toBe(testEmail);
  });

  it("should handle multiple different emails", async () => {
    const entry1 = await waitlistCtrl.addToWaitlist(testEmail);
    const entry2 = await waitlistCtrl.addToWaitlist(testEmail2);
    
    expect(entry1.email).toBe(testEmail);
    expect(entry2.email).toBe(testEmail2);
    expect(entry1.id).not.toBe(entry2.id);
    
    // Both should exist
    expect(await waitlistCtrl.isEmailInWaitlist(testEmail)).toBe(true);
    expect(await waitlistCtrl.isEmailInWaitlist(testEmail2)).toBe(true);
  });
});