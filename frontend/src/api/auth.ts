import { apiRequest } from './client';
import type { User } from '@/types';

interface LoginResponse {
  user: User;
  accessToken: string;
}

interface FamilyMember {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export const authApi = {
  members: () => apiRequest<FamilyMember[]>('/auth/members'),

  memberLogin: (memberId: string, password: string) =>
    apiRequest<LoginResponse>('/auth/member-login', {
      method: 'POST',
      body: JSON.stringify({ memberId, password }),
    }),

  createMember: (data: { displayName: string; password: string; email?: string }) =>
    apiRequest<User>('/auth/members', { method: 'POST', body: JSON.stringify(data) }),

  logout: () => apiRequest<{ message: string }>('/auth/logout', { method: 'POST' }),
};
