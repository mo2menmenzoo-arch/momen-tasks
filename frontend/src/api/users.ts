import { apiRequest } from './client';
import type { User, NotificationPrefs, EnergyHours } from '@/types';

export const usersApi = {
  getMe: () =>
    apiRequest<User>('/users/me'),

  updateMe: (data: { displayName?: string; timezone?: string; themePreference?: string; energyHours?: EnergyHours }) =>
    apiRequest<User>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),

  updateNotificationPrefs: (data: Partial<NotificationPrefs>) =>
    apiRequest<User>('/users/me/notification-prefs', { method: 'PATCH', body: JSON.stringify(data) }),

  exportData: (format: 'json' | 'csv' = 'json') =>
    apiRequest<{ message: string; exportId: string }>('/users/me/export', {
      method: 'POST',
      body: JSON.stringify({ format }),
    }),

  deleteAccount: () =>
    apiRequest<{ message: string }>('/users/me', { method: 'DELETE' }),
};
