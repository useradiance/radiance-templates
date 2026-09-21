import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../lib/errors';

const META = '_radiance/admin';

/**
 * First caller becomes admin. Later calls are idempotent no-ops for the existing admin.
 */
export const bootstrapFirstAdmin = onCall(async (request) => {
  const uid = requireAuth(request.auth);
  const db = getFirestore();
  const metaRef = db.doc(META);
  const meta = await metaRef.get();

  if (meta.exists) {
    return { ok: true as const, already: true };
  }

  const auth = getAuth();
  const user = await auth.getUser(uid);
  const claims = { ...(user.customClaims ?? {}), role: 'admin', admin: true };
  await auth.setCustomUserClaims(uid, claims);
  await metaRef.set({ uid, createdAt: new Date().toISOString() });
  await db
    .collection('users')
    .doc(uid)
    .set({ role: 'admin', updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return { ok: true as const, already: false };
});
