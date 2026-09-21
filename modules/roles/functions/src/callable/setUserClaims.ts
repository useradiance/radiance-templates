import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { invalidArgument, requireAuth } from '../lib/errors';

function requireAdmin(auth: { token?: Record<string, unknown> } | undefined) {
  const uid = requireAuth(auth as never);
  const token = auth?.token ?? {};
  if (token.admin !== true && token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Admin role required.');
  }
  return uid;
}

export const setUserClaims = onCall(async (request) => {
  requireAdmin(request.auth);
  const { uid, role } = request.data as { uid?: string; role?: string | null };
  if (!uid) invalidArgument('uid required');

  const auth = getAuth();
  const user = await auth.getUser(uid);
  const claims = { ...(user.customClaims ?? {}) } as Record<string, unknown>;

  if (role === null || role === undefined || role === '') {
    delete claims.role;
    delete claims.admin;
  } else {
    claims.role = role;
    claims.admin = role === 'admin';
  }

  await auth.setCustomUserClaims(uid, claims);
  await getFirestore()
    .collection('users')
    .doc(uid)
    .set(
      {
        role: role || null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  return { ok: true as const };
});
