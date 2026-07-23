import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SyncChange } from '@/types';

interface OfflineStore {
  isOnline: boolean;
  syncQueue: SyncChange[];
  pendingConflicts: number;
  setOnline: (online: boolean) => void;
  addToQueue: (change: SyncChange) => void;
  clearQueue: () => void;
  setPendingConflicts: (count: number) => void;
}

export const useOfflineStore = create<OfflineStore>()(
  persist(
    (set) => ({
      isOnline: navigator.onLine,
      syncQueue: [],
      pendingConflicts: 0,
      setOnline: (online) => set({ isOnline: online }),
      addToQueue: (change) => set((state) => ({ syncQueue: [...state.syncQueue, change] })),
      clearQueue: () => set({ syncQueue: [] }),
      setPendingConflicts: (count) => set({ pendingConflicts: count }),
    }),
    { name: 'momen-offline' }
  )
);
