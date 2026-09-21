import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { randomBytes } from 'node:crypto';

import { invalidArgument, requireAuth } from '../lib/errors';

export const createInvite = onCall(async (request) => {
  const uid = requireAuth(request.auth);
  const { targetType, targetId } = (request.data ?? {}) as {
    targetType?: string;
    targetId?: string;
  };

  if (targetType === 'workspace') {
    if (!targetId) invalidArgument('targetId required for workspace invites');
    const workspace = await getFirestore().collection('workspaces').doc(targetId).get();
    if (!workspace.exists) invalidArgument('Workspace not found');
    if (workspace.data()?.ownerId !== uid) {
      throw new HttpsError('permission-denied', 'Only the workspace owner can invite members');
    }
  }

  if (targetType === 'project') {
    if (!targetId) invalidArgument('targetId required for project invites');
    const project = await getFirestore().collection('projects').doc(targetId).get();
    if (!project.exists) invalidArgument('Project not found');
    if (project.data()?.ownerId !== uid) {
      throw new HttpsError('permission-denied', 'Only the project owner can invite members');
    }
  }

  const code = randomBytes(4).toString('hex');
  await getFirestore()
    .collection('invites')
    .doc(code)
    .set({
      code,
      createdBy: uid,
      targetType: targetType ?? null,
      targetId: targetId ?? null,
      createdAt: new Date(),
      usedBy: null,
    });
  return { code };
});
