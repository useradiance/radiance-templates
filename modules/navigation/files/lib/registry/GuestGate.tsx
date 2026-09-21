import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { StateView } from '@/components/ui/StateView';
import { useSession } from '@/lib/registry/session';

/**
 * Guest gate (Ephytron FtueCheckProvider pattern).
 * Keeps authenticated users out of auth screens by redirecting into the app shell.
 */
export function GuestGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useSession();

  if (isLoading) {
    return <StateView kind="loading" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return <>{children}</>;
}
