import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { call } from '@/lib/callable';
import { getDemoDocuments } from '@/lib/demo-content';
import type { DemoPayload } from '@/lib/demo-types';
import { useFirestoreEmulator, useFunctionsEmulator } from '@/lib/env';
import { getDb } from '@/lib/firestore';
import { logger } from '@/lib/logger';

export function isDemoSeedEnabled(): boolean {
  return process.env.EXPO_PUBLIC_SEED_DEMO === 'true';
}

/**
 * Seeds starter overlay documents after first sign-in.
 *
 * Prefer the `seedDemo` callable (Admin SDK, once-per-project lock). On the free-plan
 * posture — Functions emulator + cloud Firestore — Admin SDK uses Application Default
 * Credentials, which are often a different Google account than `firebase login` and then
 * fail with PERMISSION_DENIED. In that case we write from the client instead (rules still
 * apply).
 */
export async function seedDemo(uid: string): Promise<{ already: boolean }> {
  const payload = getDemoDocuments(uid);
  const hasCollections = Object.keys(payload.collections).length > 0;
  const hasNested = (payload.nested?.length ?? 0) > 0;
  if (!hasCollections && !hasNested) {
    return { already: true };
  }

  if (useFunctionsEmulator && !useFirestoreEmulator) {
    logger.info('demo seed via client (Functions emulator + cloud Firestore)');
    return seedDemoFromClient(payload);
  }

  try {
    return await call('seedDemo', payload);
  } catch (error) {
    logger.warn('seedDemo callable failed; falling back to client writes', error);
    return seedDemoFromClient(payload);
  }
}

async function seedDemoFromClient(payload: DemoPayload): Promise<{ already: boolean }> {
  const db = getDb();
  let wrote = 0;

  for (const [name, docs] of Object.entries(payload.collections)) {
    for (const item of docs) {
      const { id, ...fields } = item;
      if (typeof id !== 'string' || !id) continue;
      try {
        await setDoc(
          doc(db, name, id),
          {
            ...fields,
            seeded: true,
            createdAt: serverTimestamp(),
            publishedAt: serverTimestamp(),
          },
          { merge: true },
        );
        wrote += 1;
      } catch (error) {
        logger.warn(`demo seed skipped ${name}/${id}`, error);
      }
    }
  }

  for (const item of payload.nested ?? []) {
    const { parent, parentId, subcollection, id, ...fields } = item;
    if (
      typeof parent !== 'string' ||
      typeof parentId !== 'string' ||
      typeof subcollection !== 'string' ||
      typeof id !== 'string'
    ) {
      continue;
    }
    try {
      await setDoc(
        doc(db, parent, parentId, subcollection, id),
        {
          ...fields,
          seeded: true,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
      wrote += 1;
    } catch (error) {
      logger.warn(`demo seed skipped ${parent}/${parentId}/${subcollection}/${id}`, error);
    }
  }

  if (wrote === 0) {
    throw new Error(
      'Demo seed could not write any documents. Check Firestore rules, or run `gcloud auth application-default login` with the same account as `firebase login` so the Functions emulator can write to cloud Firestore.',
    );
  }

  return { already: false };
}
