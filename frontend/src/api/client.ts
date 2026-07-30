import { useAuthStore } from '@/stores/auth.store';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthError extends Error {
  constructor(message = 'Session expired') {
    super(message);
    this.name = 'AuthError';
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (response.ok) {
      await response.json();
      return true;
    }
    // Refresh failed — tokens are expired/invalid. Clear stale auth state
    if (response.status === 401) {
      useAuthStore.getState().logout();
    }
    return false;
  } catch {
    return false;
  }
}

export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });

  if (response.status === 401) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken();
    }
    const refreshed = await refreshPromise;
    refreshPromise = null;
    if (refreshed) {
      return apiRequest<T>(endpoint, options);
    }
    throw new AuthError();
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(response.status, error.message || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json();
  if (body && typeof body === 'object' && 'success' in body && 'timestamp' in body) {
    return body.data;
  }
  return body;
}

export function getApiBase(): string {
  return BASE_URL;
}
