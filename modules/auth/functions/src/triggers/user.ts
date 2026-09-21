import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { beforeUserCreated, beforeUserSignedIn } from 'firebase-functions/v2/identity';
import { logger } from 'firebase-functions';

import { runOnce } from '../lib/idempotency';

/**
 * Authoritative profile provisioning (idempotent).
 *
 * Blocking identity triggers run inside the sign-up flow, so the profile document exists
 * before the client ever reads it. The client-side `ensureUserProfile` remains as a
 * fallback for projects without Cloud Functions and is also idempotent (merge + exists check).
 */
export const onUserCreated = beforeUserCreated(async (event) => {
  const user = event.data;
  if (!user) return;

  await runOnce(`auth.onUserCreated:${user.uid}`, async () => {
    const ref = getFirestore().collection('users').doc(user.uid);
    const existing = await ref.get();
    if (existing.exists) {
      logger.info('Profile already provisioned', { uid: user.uid });
      return;
    }

    await ref.set(
      {
        uid: user.uid,
        email: user.email ?? null,
        displayName: user.displayName ?? null,
        nameLower: (user.displayName ?? '').toLowerCase(),
        photoURL: user.photoURL ?? null,
        providerIds: (user.providerData ?? []).map((provider) => provider.providerId),
        isAnonymous: user.providerData?.length === 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    logger.info('Provisioned profile', { uid: user.uid });
  });
});

/** Keeps `lastSignedInAt` fresh without an extra client write on every launch. */
export const onUserSignedIn = beforeUserSignedIn(async (event) => {
  const user = event.data;
  if (!user) return;

  await getFirestore()
    .collection('users')
    .doc(user.uid)
    .set({ lastSignedInAt: FieldValue.serverTimestamp() }, { merge: true });
});
