import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvZustandStorage } from '@/lib/mmkv';

export type AppearancePreference = 'light' | 'dark' | 'system';

type AppearanceState = {
  preference: AppearancePreference;
  setPreference: (preference: AppearancePreference) => void;
};

export const useAppearanceStore = create<AppearanceState>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: 'radiance.appearance',
      storage: createJSONStorage(() => mmkvZustandStorage),
    },
  ),
);
