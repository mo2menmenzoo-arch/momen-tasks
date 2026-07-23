import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type EnergyMode = 'high' | 'medium' | 'low';

interface EnergyStore {
  mode: EnergyMode;
  setMode: (mode: EnergyMode) => void;
}

export const useEnergyStore = create<EnergyStore>()(
  persist(
    (set) => ({
      mode: 'medium',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'momen-energy' }
  )
);
