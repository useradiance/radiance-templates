import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { REMOTE_CONFIG_DEFAULTS, type RemoteConfigValues } from '@/lib/remote-config';
import { fetchRemoteConfig } from '@/lib/remote-config-client';

const RemoteConfigContext = createContext<RemoteConfigValues>(REMOTE_CONFIG_DEFAULTS);

export function RemoteConfigProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<RemoteConfigValues>(REMOTE_CONFIG_DEFAULTS);

  useEffect(() => {
    let cancelled = false;
    fetchRemoteConfig()
      .then((next) => {
        if (!cancelled) setValues(next);
      })
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => values, [values]);
  return <RemoteConfigContext.Provider value={value}>{children}</RemoteConfigContext.Provider>;
}

export function useRemoteConfig(): RemoteConfigValues {
  return useContext(RemoteConfigContext);
}

export function useRemoteFlag(key: keyof RemoteConfigValues): boolean {
  const values = useRemoteConfig();
  const raw = values[key];
  return typeof raw === 'boolean' ? raw : Boolean(raw);
}
