import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';

import { emulatorHost, useFirestoreEmulator } from '@/lib/env';
import { getFirebaseApp } from '@/lib/firebase';
import { isWeb } from '@/lib/platform';

const FIRESTORE_EMULATOR_PORT = 8080;

let db: Firestore | undefined;

/**
 * Firestore instance for the app.
 *
 * Disk-backed persistence relies on IndexedDB, so it is enabled on web only. On native the
 * SDK keeps an in-memory cache and still queues writes while offline — they flush on
 * reconnect within the same app session. For cross-restart native persistence, enable the
 * firestore module's `rnfirebase` option.
 */
export function getDb(): Firestore {
  if (db) return db;

  const app = getFirebaseApp();

  try {
    db = initializeFirestore(app, {
      localCache: isWeb
        ? persistentLocalCache({ tabManager: persistentMultipleTabManager() })
        : memoryLocalCache(),
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    // Already started (fast refresh, or another module initialised it first).
    db = getFirestore(app);
  }

  if (useFirestoreEmulator) {
    connectFirestoreEmulator(db, emulatorHost, FIRESTORE_EMULATOR_PORT);
  }

  return db;
}

export { useCollection, type CollectionResult, type QueryStatus } from '@/hooks/useCollection';
export { useDocument } from '@/hooks/useDocument';
