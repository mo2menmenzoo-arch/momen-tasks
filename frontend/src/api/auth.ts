import { apiRequest } from './client';
import type { User } from '@/types';

interface LoginResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  signup: (data: { email: string; password: string; displayName: string }) =>
    apiRequest<{ message: string }>('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  logout: () =>
    apiRequest<{ message: string }>('/auth/logout', { method: 'POST' }),

  magicLink: (email: string) =>
    apiRequest<{ message: string }>('/auth/magic-link', { method: 'POST', body: JSON.stringify({ email }) }),

  magicLinkVerify: (token: string) =>
    apiRequest<LoginResponse>('/auth/magic-link/verify', { method: 'POST', body: JSON.stringify({ token }) }),

  googleAuth: () =>
    apiRequest<{ url: string }>('/auth/google', { method: 'POST' }),

  appleAuth: (identityToken: string) =>
    apiRequest<LoginResponse>('/auth/apple', { method: 'POST', body: JSON.stringify({ identityToken }) }),

  verifyEmail: (token: string) =>
    apiRequest<{ message: string }>('/auth/verify-email/confirm', { method: 'POST', body: JSON.stringify({ token }) }),

  forgotPassword: (email: string) =>
    apiRequest<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token: string, password: string) =>
    apiRequest<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
};
