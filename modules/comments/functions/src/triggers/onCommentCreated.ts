import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';

import { notifyUser } from '../lib/notify';

async function parentAuthorId(parentPath: string): Promise<string | null> {
  const parts = parentPath.split('/').filter(Boolean);
  const db = getFirestore();
  if (parts.length === 2) {
    const snap = await db.collection(parts[0]).doc(parts[1]).get();
    return (
      (snap.data()?.authorId as string | undefined) ??
      (snap.data()?.userId as string | undefined) ??
      null
    );
  }
  if (parts.length === 4) {
    const snap = await db
      .collection(parts[0])
      .doc(parts[1])
      .collection(parts[2])
      .doc(parts[3])
      .get();
    return (snap.data()?.authorId as string | undefined) ?? null;
  }
  return null;
}

/**
 * Notify the parent author when someone else comments (threads, posts, articles, tasks).
 */
export const onCommentCreated = onDocumentCreated('comments/{commentId}', async (event) => {
  const data = event.data?.data();
  if (!data) return;
  const parentPath = String(data.parentPath ?? '');
  const authorId = String(data.authorId ?? '');
  if (!parentPath || !authorId) return;

  const parentAuthor = await parentAuthorId(parentPath);
  if (!parentAuthor || parentAuthor === authorId) return;

  const preview =
    String(data.text ?? '')
      .trim()
      .slice(0, 80) || 'New comment';
  logger.info('comment push', { parentPath, parentAuthor });
  await notifyUser(parentAuthor, 'New reply', preview, { parentPath });
});
