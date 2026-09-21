import { call } from '@/lib/callable';

/** Admin-only: set or clear a custom claim role on a user. */
export async function setUserRole(uid: string, role: string | null): Promise<void> {
  await call('setUserClaims', { uid, role });
}
