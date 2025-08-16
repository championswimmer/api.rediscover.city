import { eq, and } from "drizzle-orm";
import { DatabaseType } from "../db/init";
import { invitesTable, InviteModel } from "../db/schema";
import { InviteService } from "../services/invite";

export class InviteController {
  constructor(private db: DatabaseType) {}

  /**
   * Create a new invite for an email address
   */
  async createInvite(email: string): Promise<InviteModel> {
    // Check if invite already exists for this email
    const existingInvite = await this.db
      .select()
      .from(invitesTable)
      .where(eq(invitesTable.email, email))
      .limit(1)
      .then(invites => invites[0] || null);

    if (existingInvite) {
      throw new Error("Invite already exists for this email");
    }

    // Generate a unique invite code
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = InviteService.generateInviteCode();
      const codeExists = await this.db
        .select()
        .from(invitesTable)
        .where(eq(invitesTable.code, code))
        .limit(1)
        .then(invites => invites.length > 0);
      
      if (!codeExists) {
        break;
      }
      
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error("Failed to generate unique invite code");
    }

    const [invite] = await this.db
      .insert(invitesTable)
      .values({
        email,
        code: code!,
      })
      .returning();

    return invite;
  }

  /**
   * Validate an invite code for a specific email
   */
  async validateInvite(email: string, code: string): Promise<boolean> {
    const normalizedCode = InviteService.normalizeCode(code);
    
    const invite = await this.db
      .select()
      .from(invitesTable)
      .where(
        and(
          eq(invitesTable.email, email),
          eq(invitesTable.code, normalizedCode)
        )
      )
      .limit(1)
      .then(invites => invites[0] || null);

    return invite !== null;
  }

  /**
   * Get invite by email (for admin purposes)
   */
  async getInviteByEmail(email: string): Promise<InviteModel | null> {
    const invite = await this.db
      .select()
      .from(invitesTable)
      .where(eq(invitesTable.email, email))
      .limit(1)
      .then(invites => invites[0] || null);

    return invite;
  }

  /**
   * Delete an invite (after successful registration)
   */
  async deleteInvite(email: string): Promise<void> {
    await this.db
      .delete(invitesTable)
      .where(eq(invitesTable.email, email));
  }
}