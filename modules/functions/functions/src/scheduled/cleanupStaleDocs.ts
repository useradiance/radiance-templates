import { getFirestore } from 'firebase-admin/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';

/**
 * Example scheduled cleanup — delete stale docs from a collection in batches.
 * Copy and adapt for invite codes, drafts, or other ephemeral data.
 */
export const cleanupStaleDocs = onSchedule('every day 02:00', async () => {
  const db = getFirestore();
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const snap = await db.collection('ephemeral').where('createdAt', '<', cutoff).limit(400).get();

  if (snap.empty) {
    logger.info('cleanupStaleDocs: nothing to delete');
    return;
  }

  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  logger.info('cleanupStaleDocs: deleted', { count: snap.size });
});
