/**
 * When demo/preview is on and Firestore is empty or failing, show seeded documents
 * so the starter looks like a product instead of an empty StateView.
 */
export function withDemoFallback<T>(live: T[], fallback: T[]): T[] {
  if (live.length > 0) return live;
  const preview =
    process.env.EXPO_PUBLIC_SEED_DEMO === 'true' || process.env.EXPO_PUBLIC_UI_PREVIEW === 'true';
  return preview ? fallback : live;
}
