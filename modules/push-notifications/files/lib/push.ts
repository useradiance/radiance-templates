import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { getDb } from '@/lib/firestore';
import { devicePlatform, isAndroid, isWeb } from '@/lib/platform';

export type PushRegistration = {
  token: string;
  granted: boolean;
};

/** Documents are keyed by a sanitised token so re-registering the same device is a no-op. */
function deviceDocId(token: string): string {
  return token.replace(/[^a-zA-Z0-9]/g, '').slice(0, 64);
}

export async function requestPushPermissions(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  if (!existing.canAskAgain) return false;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/**
 * Registers this device for Expo push and returns the token.
 *
 * Returns `null` on simulators, on web, and when the user declines — callers should treat a
 * missing token as "push is unavailable", never as an error.
 */
export async function registerForPushNotifications(): Promise<PushRegistration | null> {
  if (isWeb || !Device.isDevice) return null;

  const granted = await requestPushPermissions();
  if (!granted) return null;

  if (isAndroid) {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? undefined;

  const { data: token } = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );

  return { token, granted: true };
}

/** Stores the token under the user so Cloud Functions can fan out to every device. */
export async function saveDeviceToken(uid: string, token: string): Promise<void> {
  await setDoc(
    doc(getDb(), 'users', uid, 'devices', deviceDocId(token)),
    {
      token,
      platform: devicePlatform,
      deviceName: Device.deviceName ?? null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
