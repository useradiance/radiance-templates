import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvZustandStorage } from '@/lib/mmkv';

type ConsentState = {
  analytics: boolean | null;
  setAnalytics: (value: boolean) => void;
};

export const useConsentStore = create<ConsentState>()(
  persist(
    (set) => ({
      analytics: null,
      setAnalytics: (analytics) => set({ analytics }),
    }),
    {
      name: 'radiance.consent',
      storage: createJSONStorage(() => mmkvZustandStorage),
    },
  ),
);
