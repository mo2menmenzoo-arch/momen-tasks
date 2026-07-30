import { User } from "@prisma/client";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    emailVerified: boolean;
    authProvider: string;
    timezone: string;
    themePreference: string;
    subscriptionTier: string;
    role: string;
    energyHours: Record<string, unknown> | null;
    notificationPrefs: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
  };
  accessToken: string;
}

export interface TokenSet {
  accessToken: string;
  refreshToken: string;
}
