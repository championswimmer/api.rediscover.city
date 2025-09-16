import { eq } from "drizzle-orm";
import { DatabaseType } from "../db/init";
import { usersTable, UserModel, googleOauthTable } from "../db/schema";
import { AuthService } from "../services/auth";
import { InviteController } from "./invite.controller";

export class AuthController {
  private inviteCtrl: InviteController;

  constructor(private db: DatabaseType) {
    this.inviteCtrl = new InviteController(db);
  }

  /**
   * Authenticate user with email and password
   */
  async login(email: string, password: string): Promise<UserModel | null> {
    const user = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
      .then(users => users[0] || null);

    if (!user) {
      return null;
    }

    const isValidPassword = AuthService.verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  /**
   * Get user by ID (for JWT validation)
   */
  async getUserById(id: string): Promise<UserModel | null> {
    const user = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1)
      .then(users => users[0] || null);

    return user;
  }

  /**
   * Authenticate JWT request - centralizes auth logic for all protected routes
   */
  async authenticateRequest(headers: any, jwt: any, set: any): Promise<{ error?: any; user?: UserModel }> {
    const authorization = headers.authorization;

    if (!authorization) {
      set.status = 401;
      return { error: { message: "Authorization header required" } };
    }

    const token = authorization.startsWith("Bearer ")
      ? authorization.substring(7)
      : authorization;

    try {
      const payload = await jwt.verify(token);

      if (!payload || typeof payload !== "object" || !payload.userId) {
        set.status = 401;
        return { error: { message: "Invalid token" } };
      }

      const user = await this.getUserById(String(payload.userId));

      if (!user) {
        set.status = 401;
        return { error: { message: "User not found" } };
      }

      return { user };
    } catch (error) {
      set.status = 401;
      return { error: { message: "Invalid or expired token" } };
    }
  }

  /**
   * Create a new user
   */
  async createUser(email: string, password: string, inviteCode: string): Promise<UserModel> {
    // Check if user already exists first
    const existingUser = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
      .then(users => users[0] || null);

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Validate invite code
    const isValidInvite = await this.inviteCtrl.validateInvite(email, inviteCode);
    if (!isValidInvite) {
      throw new Error("Invalid invite code for this email");
    }

    const passwordHash = AuthService.hashPassword(password);

    const [user] = await this.db
      .insert(usersTable)
      .values({
        email,
        passwordHash,
      })
      .returning();

    // Delete the invite after successful registration
    await this.inviteCtrl.deleteInvite(email);

    return user;
  }

  /**
   * Get user by Google ID (for Google OAuth)
   */
  async getUserByGoogleId(googleId: string): Promise<UserModel | null> {
    const user = await this.db
      .select()
      .from(googleOauthTable)
      .innerJoin(usersTable, eq(googleOauthTable.userId, usersTable.id))
      .where(eq(googleOauthTable.googleId, googleId))
      .limit(1)
      .then(results => results[0]?.users || null);

    return user;
  }

  /**
   * Create or get a user with Google OAuth
   * NOTE: This will merge account if email already exists with non-Google login
   */
  async getOrCreateUserWithGoogle(googleId: string, email: string, name: string, avatarUrl: string, accessToken: string, refreshToken: string | null): Promise<UserModel> {
    // Check if user already exists first
    const existingUser = await this.getUserByGoogleId(googleId);

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const [user] = await this.db
      .insert(usersTable)
      .values({
        email,
        passwordHash: null, // No password for OAuth users
      })
      .returning();
    
    // Link Google OAuth info
    await this.db
      .insert(googleOauthTable)
      .values({
        userId: user.id,
        googleId,
        email,
        name,
        avatarUrl,
        accessToken,
        refreshToken,
      });
      
    return user;
  }
}