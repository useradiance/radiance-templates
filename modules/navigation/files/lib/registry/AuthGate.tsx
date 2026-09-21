import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { StateView } from '@/components/ui/StateView';
import { useSession } from '@/lib/registry/session';

function isUiPreview() {
  return process.env.EXPO_PUBLIC_UI_PREVIEW === 'true';
}

/**
 * Signed-in gate (Ephytron AuthCheckProvider pattern).
 * Renders a loading state until the session is known, then redirects guests to sign-in.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useSession();

  if (isUiPreview()) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <StateView kind="loading" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <>{children}</>;
}
