import {
  getCrashlytics,
  log,
  recordError as recordNativeError,
  setAttribute,
  setCrashlyticsCollectionEnabled,
  setUserId,
} from '@react-native-firebase/crashlytics';

/**
 * Native crash reporting.
 *
 * Metro picks `crashlytics.web.ts` for web builds, so this file only ever runs on iOS and
 * Android where the native module exists.
 */
export function recordError(error: unknown, context?: Record<string, string>): void {
  const normalized = error instanceof Error ? error : new Error(String(error));
  const crashlytics = getCrashlytics();

  if (context) {
    for (const [key, value] of Object.entries(context)) {
      void setAttribute(crashlytics, key, value);
    }
  }

  recordNativeError(crashlytics, normalized);
}

export function logBreadcrumb(message: string): void {
  log(getCrashlytics(), message);
}

export function identifyForCrashReports(userId: string | null): void {
  void setUserId(getCrashlytics(), userId ?? '');
}

export function setCrashReportingEnabled(enabled: boolean): void {
  void setCrashlyticsCollectionEnabled(getCrashlytics(), enabled);
}
