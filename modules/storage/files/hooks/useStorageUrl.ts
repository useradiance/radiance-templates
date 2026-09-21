import { useEffect, useState } from 'react';

import { logger } from '@/lib/logger';
import { resolveDownloadUrl } from '@/lib/storage';

/**
 * Resolves a cached download URL for a storage path stored in Firestore.
 */
export function useStorageUrl(path: string | null | undefined): {
  url: string | null;
  isLoading: boolean;
  error: Error | null;
} {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(path));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!path) {
      setUrl(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    void resolveDownloadUrl(path)
      .then((resolved) => {
        if (!cancelled) {
          setUrl(resolved);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          logger.warn(`useStorageUrl failed (${path})`, err);
          setUrl(null);
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return { url, isLoading, error };
}
