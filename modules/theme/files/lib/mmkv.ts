import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

/** Shared MMKV instance for app preferences (theme, UI). Requires a development build. */
export const appStorage = createMMKV({ id: 'radiance-app' });

/** Zustand storage adapter backed by MMKV. */
export const mmkvZustandStorage: StateStorage = {
  getItem: (name) => appStorage.getString(name) ?? null,
  setItem: (name, value) => {
    appStorage.set(name, value);
  },
  removeItem: (name) => {
    appStorage.remove(name);
  },
};
