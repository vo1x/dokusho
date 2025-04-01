import "next-auth";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    error?: "RefreshAccessTokenError" | "RefreshTokenExpired" | string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface Profile {
    id: string;
    name: string;
    image?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
    userId?: string;
    expires_at?: number;
    error?: "RefreshAccessTokenError" | "RefreshTokenExpired" | string;
  }
}

// Add types for the AniList token response
interface AniListTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token?: string;
}