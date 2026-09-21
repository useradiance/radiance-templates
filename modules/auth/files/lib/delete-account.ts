import { call } from '@/lib/callable';
import { getFirebaseAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * Deletes the signed-in account via Cloud Functions, then signs out locally.
 * Requires the `functions` + `callable-client` modules.
 */
export async function deleteCurrentAccount(): Promise<void> {
  await call('deleteAccount', {});
  try {
    await getFirebaseAuth().signOut();
  } catch (error) {
    logger.warn('local sign-out after deleteAccount failed', error);
  }
}
