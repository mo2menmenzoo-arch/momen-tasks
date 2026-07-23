import { apiRequest } from './client';
import type { Notification } from '@/types';

export const notificationsApi = {
  list: (filters?: { status?: string; type?: string; unreadOnly?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.type) params.set('type', filters.type);
    if (filters?.unreadOnly) params.set('unreadOnly', 'true');
    const qs = params.toString();
    return apiRequest<Notification[]>(`/notifications${qs ? `?${qs}` : ''}`);
  },

  markRead: (id: string) =>
    apiRequest<Notification>(`/notifications/${id}/read`, { method: 'PATCH' }),

  cancel: (id: string) =>
    apiRequest<void>(`/notifications/${id}`, { method: 'DELETE' }),
};
