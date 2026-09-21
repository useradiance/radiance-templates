import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { changeLocale, resolveInitialLocale, supportedLocales } from '@/lib/i18n';
import { mmkvZustandStorage } from '@/lib/mmkv';

export type LocalePreference = 'system' | (string & {});

type LocaleState = {
  preference: LocalePreference;
  setPreference: (preference: LocalePreference) => void;
};

function applyPreference(preference: LocalePreference): void {
  const next = preference === 'system' ? resolveInitialLocale() : preference;
  if (supportedLocales.includes(next) || preference === 'system') {
    void changeLocale(next);
  }
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (preference) => {
        set({ preference });
        applyPreference(preference);
      },
    }),
    {
      name: 'radiance.locale',
      storage: createJSONStorage(() => mmkvZustandStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.preference) applyPreference(state.preference);
      },
    },
  ),
);
