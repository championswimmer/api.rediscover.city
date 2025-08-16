import { Type } from "@sinclair/typebox";
import { randomBytes } from "crypto";

export const CreateInviteRequestSchema = Type.Object({
  email: Type.String({ format: "email" }),
});

export const CreateInviteResponseSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
  code: Type.String(),
  createdAt: Type.String(),
});

export const ValidateInviteRequestSchema = Type.Object({
  email: Type.String({ format: "email" }),
  code: Type.String({ minLength: 8, maxLength: 8 }),
});

export const ValidateInviteResponseSchema = Type.Object({
  valid: Type.Boolean(),
});

export type CreateInviteRequest = typeof CreateInviteRequestSchema.static;
export type CreateInviteResponse = typeof CreateInviteResponseSchema.static;
export type ValidateInviteRequest = typeof ValidateInviteRequestSchema.static;
export type ValidateInviteResponse = typeof ValidateInviteResponseSchema.static;

export class InviteService {
  /**
   * Generate a random 8-character alphanumeric code (lowercase)
   */
  static generateInviteCode(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    
    // Generate random bytes and convert to our character set
    const bytes = randomBytes(8);
    for (let i = 0; i < 8; i++) {
      result += chars[bytes[i] % chars.length];
    }
    
    return result;
  }

  /**
   * Normalize invite code to lowercase for case-insensitive comparison
   */
  static normalizeCode(code: string): string {
    if (!code) {
      return "";
    }
    return code.toLowerCase();
  }
}