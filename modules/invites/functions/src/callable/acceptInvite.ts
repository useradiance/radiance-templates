import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onCall } from 'firebase-functions/v2/https';

import { invalidArgument, requireAuth } from '../lib/errors';

export const acceptInvite = onCall(async (request) => {
  const uid = requireAuth(request.auth);
  const { code } = request.data as { code?: string };
  if (!code) invalidArgument('code required');

  const db = getFirestore();
  const ref = db.collection('invites').doc(code);
  const snap = await ref.get();
  if (!snap.exists) invalidArgument('Invalid invite');
  const data = snap.data()!;
  if (data.usedBy) invalidArgument('Invite already used');

  const targetType = (data.targetType as string | null) ?? null;
  const targetId = (data.targetId as string | null) ?? null;

  if (targetType === 'workspace' && targetId) {
    const workspaceRef = db.collection('workspaces').doc(targetId);
    const workspace = await workspaceRef.get();
    if (!workspace.exists) invalidArgument('Workspace no longer exists');
    await workspaceRef.update({
      memberIds: FieldValue.arrayUnion(uid),
      [`memberRoles.${uid}`]: 'member',
    });
  }

  if (targetType === 'project' && targetId) {
    const projectRef = db.collection('projects').doc(targetId);
    const project = await projectRef.get();
    if (!project.exists) invalidArgument('Project no longer exists');
    await projectRef.update({
      memberIds: FieldValue.arrayUnion(uid),
    });
  }

  await ref.update({ usedBy: uid, usedAt: new Date() });
  return {
    ok: true as const,
    targetType: targetType ?? undefined,
    targetId: targetId ?? undefined,
  };
});
