import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { onCall } from 'firebase-functions/v2/https';

import { invalidArgument, requireAuth } from '../lib/errors';

const ALLOWED = new Set([
  'products',
  'services',
  'events',
  'articles',
  'listings',
  'channels',
  'locations',
  'posts',
  'habits',
  'workspaces',
  'projects',
  'users',
  'comments',
  'follows',
  'discounts',
  'appointments',
  'categories',
  'items',
  'warehouses',
  'stock',
]);

const ALLOWED_NESTED: Record<string, Set<string>> = {
  posts: new Set(['likes']),
  events: new Set(['rsvps']),
};

const ID_RE = /^[A-Za-z0-9._-]+$/;
const META = '_radiance/demo';
/** Bump when a starter's seed payload grows so existing projects can pick up new docs. */
const SEED_VERSION = 4;

type SeedDoc = { id?: string } & Record<string, unknown>;

type NestedSeedDoc = {
  parent?: string;
  parentId?: string;
  subcollection?: string;
  id?: string;
} & Record<string, unknown>;

function requireId(value: unknown, label: string): string {
  if (typeof value !== 'string' || !ID_RE.test(value)) {
    invalidArgument(`${label} must be a simple id`);
  }
  return value;
}

/**
 * Writes starter overlay documents once per seed version. Client payloads are allowlisted
 * by collection name; production apps should leave EXPO_PUBLIC_SEED_DEMO unset.
 */
export const seedDemo = onCall(async (request) => {
  const uid = requireAuth(request.auth);
  const collections = (request.data as { collections?: Record<string, SeedDoc[]> })?.collections;
  const nested = (request.data as { nested?: NestedSeedDoc[] })?.nested;
  if (!collections || typeof collections !== 'object') {
    invalidArgument('collections required');
  }

  const db = getFirestore();
  const metaRef = db.doc(META);
  const meta = await metaRef.get();
  const existingVersion = Number(meta.data()?.version ?? (meta.exists ? 1 : 0));
  if (existingVersion >= SEED_VERSION) {
    return { ok: true as const, already: true };
  }

  const batch = db.batch();
  batch.set(metaRef, {
    seededBy: uid,
    seededAt: new Date().toISOString(),
    version: SEED_VERSION,
  });

  for (const [name, docs] of Object.entries(collections)) {
    if (!ALLOWED.has(name)) {
      invalidArgument(`collection not allowed: ${name}`);
    }
    if (!Array.isArray(docs)) continue;
    for (const doc of docs) {
      const id = requireId(doc.id, `${name} document id`);
      const { id: _id, ...fields } = doc;
      batch.set(db.collection(name).doc(id), {
        ...fields,
        seeded: true,
        seededBy: uid,
        createdAt: FieldValue.serverTimestamp(),
        publishedAt: FieldValue.serverTimestamp(),
      });
    }
  }

  if (Array.isArray(nested)) {
    for (const doc of nested) {
      const parent = requireId(doc.parent, 'nested parent');
      const parentId = requireId(doc.parentId, 'nested parentId');
      const subcollection = requireId(doc.subcollection, 'nested subcollection');
      const id = requireId(doc.id, 'nested id');
      if (!ALLOWED_NESTED[parent]?.has(subcollection)) {
        invalidArgument(`nested path not allowed: ${parent}/${subcollection}`);
      }
      const { parent: _p, parentId: _pid, subcollection: _s, id: _id, ...fields } = doc;
      batch.set(db.collection(parent).doc(parentId).collection(subcollection).doc(id), {
        ...fields,
        seeded: true,
        seededBy: uid,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  }

  await batch.commit();
  return { ok: true as const, already: false };
});
