import { eq } from "drizzle-orm";
import { DatabaseType } from "../db/init";
import { waitlistTable, WaitlistModel, NewWaitlistModel } from "../db/schema";

export class WaitlistController {
  constructor(private db: DatabaseType) {}

  /**
   * Add an email to the waitlist
   * Returns the existing record if email already exists (no error)
   */
  async addToWaitlist(email: string): Promise<WaitlistModel> {
    // Check if email already exists
    const existingEntry = await this.db
      .select()
      .from(waitlistTable)
      .where(eq(waitlistTable.email, email))
      .limit(1)
      .then(entries => entries[0] || null);

    if (existingEntry) {
      // Return existing entry without error
      return existingEntry;
    }

    // Create new waitlist entry
    const newEntry: NewWaitlistModel = {
      email,
    };

    const [createdEntry] = await this.db
      .insert(waitlistTable)
      .values(newEntry)
      .returning();

    return createdEntry;
  }

  /**
   * Check if an email exists in the waitlist
   */
  async isEmailInWaitlist(email: string): Promise<boolean> {
    const entry = await this.db
      .select()
      .from(waitlistTable)
      .where(eq(waitlistTable.email, email))
      .limit(1)
      .then(entries => entries[0] || null);

    return entry !== null;
  }

  /**
   * Get waitlist entry by email
   */
  async getWaitlistEntry(email: string): Promise<WaitlistModel | null> {
    const entry = await this.db
      .select()
      .from(waitlistTable)
      .where(eq(waitlistTable.email, email))
      .limit(1)
      .then(entries => entries[0] || null);

    return entry;
  }
}