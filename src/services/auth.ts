import { Type } from "@sinclair/typebox";
import { createHash, pbkdf2Sync, randomBytes } from "crypto";

export const LoginRequestSchema = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 6 }),
});

export const LoginResponseSchema = Type.Object({
  token: Type.String(),
  user: Type.Object({
    id: Type.String(),
    email: Type.String(),
  }),
});

export const RegisterRequestSchema = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 6 }),
});

export const RegisterResponseSchema = Type.Object({
  token: Type.String(),
  user: Type.Object({
    id: Type.String(),
    email: Type.String(),
  }),
});

export type LoginRequest = typeof LoginRequestSchema.static;
export type LoginResponse = typeof LoginResponseSchema.static;
export type RegisterRequest = typeof RegisterRequestSchema.static;
export type RegisterResponse = typeof RegisterResponseSchema.static;

export class AuthService {
  private static readonly ITERATIONS = 100000;
  private static readonly KEY_LENGTH = 64;
  private static readonly SALT_LENGTH = 32;

  /**
   * Hash a password using PBKDF2 with a random salt
   */
  static hashPassword(password: string): string {
    const salt = randomBytes(this.SALT_LENGTH);
    const hash = pbkdf2Sync(password, salt, this.ITERATIONS, this.KEY_LENGTH, 'sha512');
    
    // Store as salt:hash format
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
  }

  /**
   * Verify a password against a stored hash
   */
  static verifyPassword(password: string, storedHash: string): boolean {
    const [saltHex, hashHex] = storedHash.split(':');
    
    if (!saltHex || !hashHex) {
      return false;
    }
    
    const salt = Buffer.from(saltHex, 'hex');
    const hash = Buffer.from(hashHex, 'hex');
    
    const computedHash = pbkdf2Sync(password, salt, this.ITERATIONS, this.KEY_LENGTH, 'sha512');
    
    // Use crypto.timingSafeEqual to prevent timing attacks
    return computedHash.length === hash.length && 
           createHash('sha256').update(computedHash).digest('hex') === 
           createHash('sha256').update(hash).digest('hex');
  }
}