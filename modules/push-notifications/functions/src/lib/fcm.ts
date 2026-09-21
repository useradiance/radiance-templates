import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { logger } from 'firebase-functions';

/**
 * Best-effort FCM send to a list of device tokens (IRL pattern).
 * Returns the number of accepted messages; failures are logged, not thrown.
 */
export async function sendFcmNotification(options: {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<number> {
  const tokens = options.tokens.filter(Boolean);
  if (tokens.length === 0) return 0;

  try {
    const response = await getMessaging().sendEachForMulticast({
      tokens,
      notification: { title: options.title, body: options.body },
      data: options.data,
    });
    if (response.failureCount > 0) {
      logger.warn('FCM partial failure', {
        success: response.successCount,
        failure: response.failureCount,
      });
    }
    return response.successCount;
  } catch (error) {
    logger.error('FCM send failed', error);
    return 0;
  }
}

/** Collect Expo/FCM tokens stored under users/{uid}/devices. */
export async function listUserDeviceTokens(uid: string): Promise<string[]> {
  const devices = await getFirestore().collection(`users/${uid}/devices`).get();
  return devices.docs
    .map((doc) => doc.data().token as string | undefined)
    .filter((token): token is string => Boolean(token));
}
