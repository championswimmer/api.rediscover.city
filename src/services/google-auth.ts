import { Type, Static } from "@sinclair/typebox";

export const GoogleAuthCallbackRequestSchema = Type.Object({
  code: Type.String({ 
    description: "Authorization code from Google OAuth callback",
    examples: ["4/0AanvZzzEzk..."] 
  }),
});

export const GoogleAuthResponseSchema = Type.Object({
  token: Type.String({ description: "JWT token for the authenticated user" }),
  user: Type.Object({
    id: Type.String({ description: "User ID" }),
    email: Type.String({ description: "User email" }),
  }),
});

export type GoogleAuthCallbackRequest = Static<typeof GoogleAuthCallbackRequestSchema>;
export type GoogleAuthResponse = Static<typeof GoogleAuthResponseSchema>;

/**
 * Google OAuth service for handling authentication flows
 */
export class GoogleAuthService {
  /**
   * Exchange authorization code for access token and user info
   */
  static async exchangeCodeForToken(code: string, clientId: string, clientSecret: string, redirectUri: string) {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to exchange code for token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    return tokenData;
  }

  /**
   * Get user information from Google using access token
   */
  static async getUserInfo(accessToken: string) {
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      throw new Error(`Failed to get user info: ${errorText}`);
    }

    const userData = await userResponse.json();
    return userData;
  }
}