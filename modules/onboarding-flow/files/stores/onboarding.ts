import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvZustandStorage } from '@/lib/mmkv';

type OnboardingState = {
  completed: boolean;
  complete: () => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      complete: () => set({ completed: true }),
      reset: () => set({ completed: false }),
    }),
    {
      name: 'radiance.onboarding',
      storage: createJSONStorage(() => mmkvZustandStorage),
    },
  ),
);
