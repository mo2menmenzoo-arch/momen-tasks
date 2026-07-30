import { User } from "@prisma/client";

export class UserEntity {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  timezone: string;
  energyHours: Record<string, unknown> | null;
  themePreference: string;
  notificationPrefs: Record<string, unknown> | null;
  subscriptionTier: string;
  role: string;
  emailVerified: boolean;
  authProvider: string;
  createdAt: Date;
  updatedAt: Date;

  static fromUser(user: User): UserEntity {
    return {
      id: user.id,
      email: user.email,
      username: user.username ?? null,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      timezone: user.timezone,
      energyHours: user.energyHours as Record<string, unknown> | null,
      themePreference: user.themePreference,
      notificationPrefs: user.notificationPrefs as Record<
        string,
        unknown
      > | null,
      subscriptionTier: user.subscriptionTier,
      role: user.role,
      emailVerified: user.emailVerified,
      authProvider: user.authProvider,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
