import * as Linking from 'expo-linking';
import { useRouter, type Href } from 'expo-router';
import { useEffect, type ReactNode } from 'react';

import { pathFromUrl } from '@/lib/deep-link-utils';
import { appEvents } from '@/lib/events';
import { logger } from '@/lib/logger';

/**
 * Parses an incoming URL or path and navigates with Expo Router.
 */
export function navigateToDeepLink(
  router: { push: (href: Href) => void },
  raw: string | null | undefined,
): void {
  const path = pathFromUrl(raw);
  if (!path) return;
  logger.debug('deep-link navigate', path);
  router.push(path as Href);
}

/** Subscribes to Linking + appEvents.DeepLink for the lifetime of the tree. */
export function DeepLinkProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const handle = (url: string | null) => navigateToDeepLink(router, url);

    void Linking.getInitialURL().then(handle);

    const subscription = Linking.addEventListener('url', ({ url }) => handle(url));
    const onEvent = (payload: { path: string }) => navigateToDeepLink(router, payload.path);
    appEvents.on('DeepLink', onEvent);

    return () => {
      subscription.remove();
      appEvents.off('DeepLink', onEvent);
    };
  }, [router]);

  return <>{children}</>;
}
