import { eq } from "drizzle-orm";
import { DatabaseType } from "../db/init";
import { usersTable, UserModel } from "../db/schema";
import { AuthService } from "../services/auth";

export class AuthController {
  constructor(private db: DatabaseType) {}

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
   * Create a new user
   */
  async createUser(email: string, password: string): Promise<UserModel> {
    // Check if user already exists
    const existingUser = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
      .then(users => users[0] || null);

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = AuthService.hashPassword(password);
    
    const [user] = await this.db
      .insert(usersTable)
      .values({
        email,
        passwordHash,
      })
      .returning();

    return user;
  }
}