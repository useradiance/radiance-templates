import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { invalidArgument, requireAuth } from '../lib/errors';

export const resolveReport = onCall(async (request) => {
  const uid = requireAuth(request.auth);
  const token = request.auth?.token ?? {};
  if (token.admin !== true && token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Admin required');
  }
  const { reportId, resolution } = request.data as {
    reportId?: string;
    resolution?: 'dismissed' | 'actioned';
  };
  if (!reportId || !resolution) invalidArgument('reportId and resolution required');

  await getFirestore().collection('reports').doc(reportId).update({
    status: resolution,
    resolvedBy: uid,
    resolvedAt: new Date(),
  });
  return { ok: true as const };
});
