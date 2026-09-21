/** Firestore composite indexes return failed-precondition until they finish building. */
export function isIndexBuildingError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = 'code' in error ? String((error as { code: unknown }).code) : '';
  if (code !== 'failed-precondition') return false;
  const message =
    error instanceof Error ? error.message : String((error as { message?: unknown }).message ?? '');
  return /index/i.test(message);
}
