import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, type ReactNode } from 'react';

import { appEvents } from '@/lib/events';
import { registerForPushNotifications, saveDeviceToken } from '@/lib/push';
import { useAuthStore } from '@/stores/auth';

// Foreground presentation: show the alert, no badge bump until the app defines one.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Registers the device once a user is signed in and routes notification taps.
 *
 * A payload may carry `{ url: '/some/route' }` or `{ deeplink: '...' }` to deep link.
 */
export function PushProvider({ children }: { children: ReactNode }) {
  const uid = useAuthStore((state) => state.user?.uid ?? null);
  const router = useRouter();

  useEffect(() => {
    if (!uid) return;

    void registerForPushNotifications()
      .then((registration) => {
        if (registration) return saveDeviceToken(uid, registration.token);
      })
      .catch(() => undefined);
  }, [uid]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data ?? {};
      const path =
        (typeof data.deeplink === 'string' && data.deeplink) ||
        (typeof data.url === 'string' && data.url) ||
        null;
      if (path) {
        appEvents.emit('DeepLink', { path });
        router.push(path as never);
      }
    });

    return () => subscription.remove();
  }, [router]);

  return <>{children}</>;
}
