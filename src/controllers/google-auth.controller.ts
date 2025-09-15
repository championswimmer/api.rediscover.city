import { eq } from "drizzle-orm";
import { DatabaseType } from "../db/init";
import { usersTable, googleAuthsTable, UserModel, GoogleAuthModel, NewGoogleAuthModel } from "../db/schema";
import { GoogleAuthService } from "../services/google-auth";
import adze from "adze";

export class GoogleAuthController {
  constructor(private db: DatabaseType) {}

  /**
   * Find or create user from Google OAuth data
   */
  async findOrCreateUserFromGoogle(googleData: any, tokenData: any): Promise<{ user: UserModel; isNewUser: boolean }> {
    adze.info("Processing Google OAuth user", { email: googleData.email, googleId: googleData.id });

    // First, check if there's an existing Google auth record
    const existingGoogleAuth = await this.db
      .select({ 
        googleAuth: googleAuthsTable,
        user: usersTable 
      })
      .from(googleAuthsTable)
      .innerJoin(usersTable, eq(googleAuthsTable.userId, usersTable.id))
      .where(eq(googleAuthsTable.googleId, googleData.id))
      .limit(1)
      .then(results => results[0] || null);

    if (existingGoogleAuth) {
      adze.debug("Found existing Google auth record", { userId: existingGoogleAuth.user.id });
      
      // Update the Google auth record with new tokens
      await this.db
        .update(googleAuthsTable)
        .set({
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          updatedAt: new Date(),
        })
        .where(eq(googleAuthsTable.googleId, googleData.id));

      return { user: existingGoogleAuth.user, isNewUser: false };
    }

    // Check if there's an existing user with the same email
    const existingUser = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, googleData.email))
      .limit(1)
      .then(users => users[0] || null);

    let user: UserModel;
    let isNewUser = false;

    if (existingUser) {
      adze.debug("Found existing user with same email", { userId: existingUser.id, email: googleData.email });
      user = existingUser;
    } else {
      adze.info("Creating new user from Google OAuth", { email: googleData.email });
      
      // Create new user - no password hash needed for Google OAuth users
      const [newUser] = await this.db
        .insert(usersTable)
        .values({
          email: googleData.email,
          passwordHash: "", // Empty password hash for OAuth users
        })
        .returning();

      user = newUser;
      isNewUser = true;
    }

    // Create Google auth record
    const googleAuthData: NewGoogleAuthModel = {
      userId: user.id,
      googleId: googleData.id,
      email: googleData.email,
      name: googleData.name,
      picture: googleData.picture,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
    };

    await this.db
      .insert(googleAuthsTable)
      .values(googleAuthData);

    adze.info("Created Google auth record", { userId: user.id, googleId: googleData.id });

    return { user, isNewUser };
  }

  /**
   * Get Google auth record for a user
   */
  async getGoogleAuthByUserId(userId: string): Promise<GoogleAuthModel | null> {
    const googleAuth = await this.db
      .select()
      .from(googleAuthsTable)
      .where(eq(googleAuthsTable.userId, userId))
      .limit(1)
      .then(auths => auths[0] || null);

    return googleAuth;
  }

  /**
   * Delete Google auth record
   */
  async deleteGoogleAuth(userId: string): Promise<void> {
    await this.db
      .delete(googleAuthsTable)
      .where(eq(googleAuthsTable.userId, userId));
  }
}