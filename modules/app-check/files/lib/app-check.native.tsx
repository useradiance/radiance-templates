import {
  initializeAppCheck,
  ReactNativeFirebaseAppCheckProvider,
} from '@react-native-firebase/app-check';
import type { ReactNode } from 'react';

import { logger } from '@/lib/logger';

let started = false;

/**
 * Native App Check (App Attest / Play Integrity) via RNFirebase.
 */
export function initAppCheck(): void {
  if (started) return;
  started = true;

  try {
    const provider = new ReactNativeFirebaseAppCheckProvider();
    provider.configure({
      android: { provider: __DEV__ ? 'debug' : 'playIntegrity' },
      apple: { provider: __DEV__ ? 'debug' : 'appAttest' },
    });

    initializeAppCheck(undefined, {
      provider,
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error: unknown) {
    logger.warn('App Check init failed', error);
  }
}

initAppCheck();

export const isAppCheckActive = () => started;

export function AppCheckProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
