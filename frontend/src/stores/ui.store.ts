import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiStore {
  activeTab: string;
  isCaptureOpen: boolean;
  isTaskDetailOpen: boolean;
  activeTaskId: string | null;
  theme: 'light' | 'dark' | 'auto';
  setActiveTab: (tab: string) => void;
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;
  openCapture: () => void;
  closeCapture: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      activeTab: 'today',
      isCaptureOpen: false,
      isTaskDetailOpen: false,
      activeTaskId: null,
      theme: 'dark',
      setActiveTab: (tab) => set({ activeTab: tab }),
      openTaskDetail: (taskId) => set({ isTaskDetailOpen: true, activeTaskId: taskId }),
      closeTaskDetail: () => set({ isTaskDetailOpen: false, activeTaskId: null }),
      openCapture: () => set({ isCaptureOpen: true }),
      closeCapture: () => set({ isCaptureOpen: false }),
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme === 'auto' ? '' : theme);
        set({ theme });
      },
    }),
    { name: 'momen-ui' }
  )
);
