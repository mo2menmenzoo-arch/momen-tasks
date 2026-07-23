export type ThemePreference = 'AUTO' | 'DARK' | 'LIGHT';
export type SubscriptionTier = 'FREE' | 'PRO' | 'TEAM';
export type AuthProvider = 'EMAIL' | 'GOOGLE' | 'APPLE' | 'MAGIC_LINK';

export interface EnergyHours {
  focus: [string, string];
  low: [string, string];
}

export interface NotificationPrefs {
  email: boolean;
  push: boolean;
  dailyDigest: boolean;
  weeklyReview: boolean;
  reminderLeadTimes: string[];
  quietHoursStart: number;
  quietHoursEnd: number;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  timezone: string;
  themePreference: ThemePreference;
  subscriptionTier: SubscriptionTier;
  energyHours: EnergyHours | null;
  notificationPrefs: NotificationPrefs | null;
  emailVerified: boolean;
  authProvider: AuthProvider;
  createdAt: string;
  updatedAt: string;
}
