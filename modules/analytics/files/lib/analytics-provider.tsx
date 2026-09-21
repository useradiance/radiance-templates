import { usePathname } from 'expo-router';
import { useEffect, type ReactNode } from 'react';

import { trackScreen } from '@/lib/analytics';

/** Emits a screen_view event whenever the route changes. */
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) trackScreen(pathname);
  }, [pathname]);

  return <>{children}</>;
}
