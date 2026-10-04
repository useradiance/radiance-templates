import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

/**
 * iOS App Tracking Transparency.
 *
 * Metro picks `tracking-permission.web.ts` for web builds, so this file only
 * ever runs on iOS and Android. It has to be split out: the package has no web
 * implementation, and importing it on web throws "Cannot find native module
 * 'ExpoTrackingTransparency'" while the module graph loads — before any
 * `Platform.OS` check can run — which leaves a blank page.
 */
export async function requestTrackingPermission(): Promise<boolean> {
  const { status } = await requestTrackingPermissionsAsync();
  return status === 'granted';
}
