import { Redirect, usePathname, useSegments } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';

import { StateView } from '@/components/ui/StateView';
import { previewGuest } from '@/lib/env';
import { useSession } from '@/lib/registry/session';
import { useOnboardingStore } from '@/stores/onboarding';

function isOnboardingRoute(pathname: string, segments: string[]): boolean {
  return pathname === '/onboarding' || segments[0] === 'onboarding';
}

/**
 * Shows `/onboarding` after sign-in for users who have not finished it yet.
 * Guests still hit marketing / sign-in — the walkthrough is not the public homepage.
 */
export function OnboardingGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const segments = useSegments();
  const { isLoading: sessionLoading, isAuthenticated } = useSession();
  const completed = useOnboardingStore((s) => s.completed);
  const [hydrated, setHydrated] = useState(() => useOnboardingStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useOnboardingStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  if (!hydrated || sessionLoading) {
    return <StateView kind="loading" />;
  }

  const onboarding = isOnboardingRoute(pathname, segments as string[]);

  if (!isAuthenticated) {
    if (onboarding) {
      return <Redirect href="/" />;
    }
    return <>{children}</>;
  }

  // The hosted preview's guest is there to see the app, not its walkthrough.
  if (previewGuest && !onboarding) {
    return <>{children}</>;
  }

  if (!completed && !onboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (completed && onboarding) {
    return <Redirect href="/(app)" />;
  }

  return <>{children}</>;
}
