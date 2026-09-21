import { useEffect, type ReactNode } from 'react';

import { isDemoSeedEnabled, seedDemo } from '@/lib/demo-seed';
import { logger } from '@/lib/logger';
import { appStorage } from '@/lib/mmkv';
import { useAuthStore } from '@/stores/auth';

const SEEDED_KEY = 'radiance.demo.seeded.v3';

/** Runs the optional demo seed once per device after the user is signed in. */
export function DemoSeedProvider({ children }: { children: ReactNode }) {
  const uid = useAuthStore((state) => state.user?.uid ?? null);

  useEffect(() => {
    if (!isDemoSeedEnabled() || !uid) return;
    if (appStorage.getBoolean(SEEDED_KEY)) return;

    void seedDemo(uid)
      .then(() => {
        appStorage.set(SEEDED_KEY, true);
      })
      .catch((error) => {
        logger.error('demo seed failed', error);
      });
  }, [uid]);

  return <>{children}</>;
}
