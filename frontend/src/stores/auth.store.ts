import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
  setUser: (user: Partial<User>) => void;
  setOnboardingComplete: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      onboardingComplete: false,
      login: (user, token) => set({ user, token: token || null, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false, onboardingComplete: false }),
      setUser: (partial) => set((state) => ({ user: state.user ? { ...state.user, ...partial } : null })),
      setOnboardingComplete: () => set({ onboardingComplete: true }),
    }),
    { name: 'momen-auth' }
  )
);
