import { apiRequest } from './client';
import type { FocusSession, CreateFocusSessionInput } from '@/types';

export const focusApi = {
  list: (filters?: { taskId?: string; dateFrom?: string; dateTo?: string }) => {
    const params = new URLSearchParams();
    if (filters?.taskId) params.set('taskId', filters.taskId);
    if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.set('dateTo', filters.dateTo);
    const qs = params.toString();
    return apiRequest<FocusSession[]>(`/focus-sessions${qs ? `?${qs}` : ''}`);
  },

  getActive: () =>
    apiRequest<FocusSession | null>('/focus-sessions/active'),

  create: (data: CreateFocusSessionInput) =>
    apiRequest<FocusSession>('/focus-sessions', { method: 'POST', body: JSON.stringify(data) }),

  end: (id: string, completed: boolean) =>
    apiRequest<FocusSession>(`/focus-sessions/${id}/end`, { method: 'PATCH', body: JSON.stringify({ completed }) }),
};
