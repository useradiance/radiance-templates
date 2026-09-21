import { onCall } from 'firebase-functions/v2/https';

import { requireAuth } from '../lib/errors';

/** Connectivity check used by `radiance doctor` and the callable client smoke test. */
export const ping = onCall((request) => {
  const uid = requireAuth(request.auth);
  return { ok: true, uid, at: new Date().toISOString() };
});
