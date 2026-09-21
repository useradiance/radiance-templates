import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvZustandStorage } from '@/lib/mmkv';

type State = {
  ids: string[];
  toggle: (id: string) => void;
};

export const useBookmarksStore = create<State>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const ids = get().ids.includes(id) ? get().ids.filter((x) => x !== id) : [...get().ids, id];
        set({ ids });
      },
    }),
    { name: 'radiance.bookmarks', storage: createJSONStorage(() => mmkvZustandStorage) },
  ),
);
