import { useEffect, type ReactNode } from 'react';

import { ensureUserProfile } from '@/lib/user-profile';
import { useAuthStore } from '@/stores/auth';

/**
 * Keeps the auth store in sync with Firebase's persisted session and makes sure the signed-in
 * user has a profile document.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => useAuthStore.getState().subscribe(), []);

  const userId = useAuthStore((state) => state.user?.uid ?? null);

  useEffect(() => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    // Profile writes are best effort: a failure here must never block the app.
    void ensureUserProfile(user).catch(() => undefined);
  }, [userId]);

  return <>{children}</>;
}
