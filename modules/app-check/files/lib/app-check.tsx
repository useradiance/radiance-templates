import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check';
import type { ReactNode } from 'react';

import { getFirebaseApp } from '@/lib/firebase';
import { isWeb } from '@/lib/platform';

const siteKey = process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY;
const debugToken = process.env.EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN;

let appCheck: AppCheck | undefined;

/**
 * Starts App Check on web via reCAPTCHA.
 * Native attestation is provided by `app-check.native.ts` when RNFirebase is wired.
 */
export function initAppCheck(): AppCheck | undefined {
  if (appCheck || !isWeb || !siteKey) return appCheck;

  if (debugToken && __DEV__) {
    (globalThis as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string }).FIREBASE_APPCHECK_DEBUG_TOKEN =
      debugToken;
  }

  appCheck = initializeAppCheck(getFirebaseApp(), {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });

  return appCheck;
}

initAppCheck();

export const isAppCheckActive = () => appCheck !== undefined;

export function AppCheckProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
