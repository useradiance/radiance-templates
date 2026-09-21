import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';

import { requireAuth } from '../lib/errors';

/**
 * Deletes the caller's Auth account, Firestore profile, and avatar object.
 * Cross-user cleanup of denormalized edges is left to the product; this is the baseline.
 */
export const deleteAccount = onCall(async (request) => {
  const uid = requireAuth(request.auth);
  const db = getFirestore();

  logger.info('deleteAccount start', { uid });

  const userRef = db.collection('users').doc(uid);
  const devices = await userRef.collection('devices').listDocuments();
  await Promise.all(devices.map((doc) => doc.delete()));
  await userRef.delete().catch(() => undefined);

  try {
    await getStorage().bucket().file(`avatars/${uid}`).delete({ ignoreNotFound: true });
  } catch (error) {
    logger.warn('avatar delete skipped', { uid, error });
  }

  await getAuth().deleteUser(uid);
  logger.info('deleteAccount done', { uid });

  return { ok: true as const };
});
