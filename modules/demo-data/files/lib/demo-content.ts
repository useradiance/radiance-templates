import type { DemoPayload } from '@/lib/demo-types';

/**
 * Default seed is empty. Starter overlays replace this file with domain documents
 * (products, posts, services, …) keyed by collection name.
 */
export function getDemoDocuments(_uid: string): DemoPayload {
  return { collections: {} };
}
