import { getAnalytics, logEvent, logScreenView, setUserId } from '@react-native-firebase/analytics';

import { logger } from '@/lib/logger';

/**
 * Native analytics via RNFirebase. Metro resolves this file on iOS/Android instead of analytics.ts.
 */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  try {
    logEvent(getAnalytics(), name, params);
  } catch (error: unknown) {
    logger.warn('analytics event failed', error);
  }
}

export function trackScreen(screenName: string): void {
  void logScreenView(getAnalytics(), {
    screen_name: screenName,
    screen_class: screenName,
  }).catch((error: unknown) => logger.warn('analytics screen failed', error));
}

export function identifyUser(userId: string | null): void {
  void setUserId(getAnalytics(), userId).catch((error: unknown) =>
    logger.warn('analytics identify failed', error),
  );
}
