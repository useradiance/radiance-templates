import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteField,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  addDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';

import { getDb } from '@/lib/firestore';

export type WorkspaceRole = 'admin' | 'member';

export type Workspace = {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  /** Seat roles for non-owners. Owner is always `ownerId`. */
  memberRoles?: Record<string, WorkspaceRole>;
};

export function workspacesQuery(uid: string) {
  return query(
    collection(getDb(), 'workspaces'),
    where('memberIds', 'array-contains', uid),
    orderBy('name', 'asc'),
  );
}

export function workspaceRole(workspace: Workspace, uid: string): 'owner' | WorkspaceRole {
  if (workspace.ownerId === uid) return 'owner';
  return workspace.memberRoles?.[uid] ?? 'member';
}

export async function createWorkspace(name: string, ownerId: string) {
  const ref = await addDoc(collection(getDb(), 'workspaces'), {
    name: name.trim(),
    ownerId,
    memberIds: [ownerId],
    memberRoles: {},
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Owner-only (enforced by rules): add a collaborator by uid. */
export async function addWorkspaceMember(
  workspaceId: string,
  memberId: string,
  role: WorkspaceRole = 'member',
): Promise<void> {
  const id = memberId.trim();
  if (!id) return;
  await updateDoc(doc(getDb(), 'workspaces', workspaceId), {
    memberIds: arrayUnion(id),
    [`memberRoles.${id}`]: role,
  } as DocumentData);
}

/** Owner-only: change a non-owner seat between admin and member. */
export async function setWorkspaceMemberRole(
  workspaceId: string,
  memberId: string,
  role: WorkspaceRole,
): Promise<void> {
  await updateDoc(doc(getDb(), 'workspaces', workspaceId), {
    [`memberRoles.${memberId}`]: role,
  } as DocumentData);
}

/** Owner-only: remove a collaborator (cannot remove the owner). */
export async function removeWorkspaceMember(
  workspaceId: string,
  memberId: string,
  ownerId: string,
): Promise<void> {
  if (memberId === ownerId) {
    throw new Error('Cannot remove the workspace owner');
  }
  await updateDoc(doc(getDb(), 'workspaces', workspaceId), {
    memberIds: arrayRemove(memberId),
    [`memberRoles.${memberId}`]: deleteField(),
  } as DocumentData);
}
