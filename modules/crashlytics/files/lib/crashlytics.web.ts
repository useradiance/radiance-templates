/** Web has no Crashlytics SDK; errors go to the console so they are still visible in dev. */

export function recordError(error: unknown, context?: Record<string, string>): void {
  console.error('[crashlytics]', error, context ?? {});
}

export function logBreadcrumb(message: string): void {
  if (__DEV__) console.log('[crashlytics]', message);
}

export function identifyForCrashReports(_userId: string | null): void {}

export function setCrashReportingEnabled(_enabled: boolean): void {}
