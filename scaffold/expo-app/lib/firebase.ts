import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';

import { getFirebaseEnv } from '@/lib/env';

/**
 * Single entry point for the Firebase app instance. Feature modules build on top of
 * this (`lib/firestore.ts`, `lib/auth.ts`, ...) instead of calling `initializeApp`
 * themselves, so the app is initialised exactly once across web and native.
 */
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(getFirebaseEnv());
}
