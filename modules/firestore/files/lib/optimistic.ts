/**
 * Optimistic mutation helper.
 *
 * The local store is updated first so the UI reacts immediately, then the write is sent.
 * If the write is rejected the local change is rolled back.
 *
 * While the device is offline Firestore queues the write and its promise stays pending
 * until reconnect — that is expected. Do not block the UI on the returned promise.
 */
export type OptimisticMutation = {
  /** Apply the change locally. Runs synchronously, before any network call. */
  localApply: () => void;
  /** Send the change to Firestore. */
  remoteWrite: () => Promise<unknown>;
  /** Undo `localApply`. Called only when the write is rejected. */
  rollback: () => void;
  /** Report the failure (toast, log, Crashlytics). */
  onError?: (error: unknown) => void;
};

export async function optimisticUpdate({
  localApply,
  remoteWrite,
  rollback,
  onError,
}: OptimisticMutation): Promise<boolean> {
  localApply();

  try {
    await remoteWrite();
    return true;
  } catch (error) {
    rollback();
    onError?.(error);
    return false;
  }
}

/** Client-side id for optimistic inserts, matching Firestore's 20-character auto ids. */
export function createLocalId(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let index = 0; index < 20; index += 1) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}
