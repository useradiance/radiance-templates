import {
  addDoc,
  collection,
  doc,
  getCountFromServer,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type Query,
} from 'firebase/firestore';

import { getDb } from '@/lib/firestore';

export type Comment = {
  id: string;
  parentPath: string;
  authorId: string;
  authorName?: string | null;
  parentOwnerId?: string | null;
  text: string;
  createdAt?: { seconds: number } | null;
};

/**
 * Equality-only so a fresh project works before the composite `parentPath + createdAt`
 * index finishes building. Sort with `sortComments`.
 */
export function commentsQueryForParent(parentPath: string): Query {
  return query(collection(getDb(), 'comments'), where('parentPath', '==', parentPath));
}

export function sortComments<T extends Pick<Comment, 'id' | 'createdAt'>>(comments: T[]): T[] {
  return [...comments].sort((a, b) => {
    const delta = (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0);
    return delta !== 0 ? delta : a.id.localeCompare(b.id);
  });
}

export function commentCreatedAt(comment: Pick<Comment, 'createdAt'>): Date | null {
  const value = comment.createdAt;
  if (!value) return null;
  const maybeTimestamp = value as { seconds?: number; toDate?: () => Date };
  if (typeof maybeTimestamp.toDate === 'function') {
    return maybeTimestamp.toDate();
  }
  if (typeof maybeTimestamp.seconds === 'number') {
    return new Date(maybeTimestamp.seconds * 1000);
  }
  return null;
}

/** Cheap aggregation so feed cards can show a count without downloading every comment. */
export async function countCommentsForParent(parentPath: string): Promise<number> {
  const snap = await getCountFromServer(commentsQueryForParent(parentPath));
  return snap.data().count;
}

async function bumpParentCommentCount(parentPath: string, delta: number): Promise<void> {
  const parts = parentPath.split('/').filter(Boolean);
  if (parts.length !== 2) return;
  const [collectionName, id] = parts;
  try {
    await setDoc(
      doc(getDb(), collectionName, id),
      { commentCount: increment(delta) },
      { merge: true },
    );
  } catch {
    // Parent docs that do not allow `commentCount` still keep the comment itself.
  }
}

export async function addComment(input: {
  parentPath: string;
  authorId: string;
  authorName?: string | null;
  text: string;
  parentOwnerId?: string | null;
}): Promise<string> {
  const trimmed = input.text.trim();
  if (!trimmed) throw new Error('empty');
  const ref = await addDoc(collection(getDb(), 'comments'), {
    parentPath: input.parentPath,
    authorId: input.authorId,
    authorName: input.authorName ?? null,
    parentOwnerId: input.parentOwnerId ?? null,
    text: trimmed,
    createdAt: serverTimestamp(),
  });
  await bumpParentCommentCount(input.parentPath, 1);
  return ref.id;
}

/** Deletes comments whose parentPath is `prefix` or nested under it (cascade helpers). */
export async function deleteCommentsForParentPrefix(prefix: string): Promise<void> {
  const snap = await getDocs(
    query(
      collection(getDb(), 'comments'),
      where('parentPath', '>=', prefix),
      where('parentPath', '<=', `${prefix}\uf8ff`),
    ),
  );
  if (snap.empty) return;
  const db = getDb();
  let batch = writeBatch(db);
  let ops = 0;
  for (const docSnap of snap.docs) {
    batch.delete(docSnap.ref);
    ops += 1;
    if (ops === 400) {
      await batch.commit();
      batch = writeBatch(db);
      ops = 0;
    }
  }
  if (ops > 0) await batch.commit();
}
