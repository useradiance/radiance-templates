import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Query,
  type Timestamp,
} from 'firebase/firestore';

import { deleteCommentsForParentPrefix } from '@/lib/comments';
import { getDb } from '@/lib/firestore';
import { createLocalId } from '@/lib/optimistic';

export const PROJECTS_COLLECTION = 'projects';

export type Project = {
  id: string;
  ownerId: string;
  /** Optional collaborators — owners always retain full control. */
  memberIds?: string[];
  name: string;
  openTaskCount: number;
  createdAt: Timestamp | null;
};

export type Task = {
  id: string;
  title: string;
  done: boolean;
  authorId?: string | null;
  createdAt: Timestamp | null;
};

export function projectsQuery(ownerId: string): Query<Project> {
  return query(
    collection(getDb(), PROJECTS_COLLECTION),
    where('memberIds', 'array-contains', ownerId),
    orderBy('createdAt', 'desc'),
  ) as Query<Project>;
}

export function tasksQuery(projectId: string): Query<Task> {
  return query(
    collection(getDb(), PROJECTS_COLLECTION, projectId, 'tasks'),
    orderBy('createdAt', 'asc'),
  ) as Query<Task>;
}

export async function createProject(ownerId: string, name: string): Promise<string> {
  const id = createLocalId();
  await setDoc(doc(getDb(), PROJECTS_COLLECTION, id), {
    ownerId,
    memberIds: [ownerId],
    name: name.trim(),
    openTaskCount: 0,
    createdAt: serverTimestamp(),
  });
  return id;
}

/** Owner-only: add a collaborator uid to memberIds (pair with roles/invites for production). */
export async function addProjectMember(projectId: string, memberId: string): Promise<void> {
  await updateDoc(doc(getDb(), PROJECTS_COLLECTION, projectId), {
    memberIds: arrayUnion(memberId),
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  const db = getDb();
  const tasks = await getDocs(collection(db, PROJECTS_COLLECTION, projectId, 'tasks'));
  let batch = writeBatch(db);
  let ops = 0;
  for (const task of tasks.docs) {
    batch.delete(task.ref);
    ops += 1;
    if (ops === 400) {
      await batch.commit();
      batch = writeBatch(db);
      ops = 0;
    }
  }
  if (ops > 0) await batch.commit();
  await deleteCommentsForParentPrefix(`projects/${projectId}`);
  await deleteDoc(doc(db, PROJECTS_COLLECTION, projectId));
}

export async function createTask(
  projectId: string,
  title: string,
  authorId?: string,
): Promise<string> {
  const id = createLocalId();
  await setDoc(doc(getDb(), PROJECTS_COLLECTION, projectId, 'tasks', id), {
    title: title.trim(),
    done: false,
    authorId: authorId ?? null,
    createdAt: serverTimestamp(),
  });
  return id;
}

export async function setTaskDone(projectId: string, taskId: string, done: boolean): Promise<void> {
  await updateDoc(doc(getDb(), PROJECTS_COLLECTION, projectId, 'tasks', taskId), { done });
}

export async function deleteTask(projectId: string, taskId: string): Promise<void> {
  await deleteCommentsForParentPrefix(`projects/${projectId}/tasks/${taskId}`);
  await deleteDoc(doc(getDb(), PROJECTS_COLLECTION, projectId, 'tasks', taskId));
}
