import { create } from 'zustand';

type SyncState = {
  /** True when the most recent snapshots were served from cache without server contact. */
  isOffline: boolean;
  /** True while local writes have not yet been acknowledged by the server. */
  hasPendingWrites: boolean;
  lastSyncedAt: number | null;
  reportSnapshot: (metadata: { fromCache: boolean; hasPendingWrites: boolean }) => void;
};

export const useSyncStore = create<SyncState>((set) => ({
  isOffline: false,
  hasPendingWrites: false,
  lastSyncedAt: null,
  reportSnapshot: ({ fromCache, hasPendingWrites }) =>
    set((state) => ({
      isOffline: fromCache,
      hasPendingWrites,
      lastSyncedAt: fromCache ? state.lastSyncedAt : Date.now(),
    })),
}));
