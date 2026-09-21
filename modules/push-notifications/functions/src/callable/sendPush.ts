import { onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';

import { invalidArgument, requireAuth } from '../lib/errors';
import { listUserDeviceTokens, sendFcmNotification } from '../lib/fcm';

const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

/**
 * Sends a push to every device registered for the **caller** (self only).
 * Use Admin SDK / privileged callables for notifying other users.
 */
export const sendPushToUser = onCall<{
  title: string;
  body: string;
  data?: Record<string, unknown>;
  /** @deprecated Ignored — only the authenticated caller can be notified. */
  userId?: string;
}>(async (request) => {
  const uid = requireAuth(request.auth);

  const { title, body, data } = request.data;
  if (!title || !body) {
    invalidArgument('title and body are required.');
  }

  const tokens = await listUserDeviceTokens(uid);
  const expoTokens = tokens.filter((token) => token.startsWith('ExponentPushToken'));
  const fcmTokens = tokens.filter((token) => !token.startsWith('ExponentPushToken'));

  let sent = 0;

  if (expoTokens.length > 0) {
    const messages: ExpoPushMessage[] = expoTokens.map((token) => ({
      to: token,
      title,
      body,
      data,
    }));

    const response = await fetch(EXPO_PUSH_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      logger.error('Expo push request failed', { status: response.status });
    } else {
      sent += messages.length;
    }
  }

  if (fcmTokens.length > 0) {
    const stringData =
      data && Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)]));
    sent += await sendFcmNotification({
      tokens: fcmTokens,
      title,
      body,
      data: stringData,
    });
  }

  return { sent };
});
