import { getAnalytics, isSupported, logEvent, setUserId, type Analytics } from 'firebase/analytics';

import { getFirebaseApp } from '@/lib/firebase';
import { isWeb } from '@/lib/platform';
import { logger } from '@/lib/logger';

let analytics: Analytics | null | undefined;

async function resolveAnalytics(): Promise<Analytics | null> {
  if (analytics !== undefined) return analytics;

  if (!isWeb || !process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID) {
    analytics = null;
    return analytics;
  }

  analytics = (await isSupported()) ? getAnalytics(getFirebaseApp()) : null;
  return analytics;
}

/**
 * Records a product event.
 *
 * On web this uses the Firebase JS Analytics SDK. On native, the analytics module's
 * RNFirebase implementation (see analytics.native.ts when installed) takes over; the
 * web file logs in development so tracking can still be verified without a native build.
 */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (!isWeb) {
    if (__DEV__) logger.debug(`[analytics] ${name}`, params ?? {});
    return;
  }

  void resolveAnalytics()
    .then((instance) => {
      if (instance) logEvent(instance, name, params);
    })
    .catch(() => undefined);
}

export function trackScreen(screenName: string): void {
  trackEvent('screen_view', { screen_name: screenName, screen_class: screenName });
}

export function identifyUser(userId: string | null): void {
  if (!isWeb) return;

  void resolveAnalytics()
    .then((instance) => {
      if (instance) setUserId(instance, userId);
    })
    .catch(() => undefined);
}
