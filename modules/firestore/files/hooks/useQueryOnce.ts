import { getDoc, type DocumentData, type DocumentReference } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

import type { QueryStatus } from '@/hooks/useCollection';
import { logger } from '@/lib/logger';

export type OnceResult<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  status: QueryStatus;
  refetch: () => Promise<void>;
};

/** Accepts typed helpers or raw `doc(...)` — Firestore refs are invariant in T. */
export type OnceRefFactory<T> = () => DocumentReference<T> | DocumentReference<DocumentData>;

/**
 * One-shot document fetch (no realtime listener). Useful for screens that do not need
 * live updates. Pass `null` key to skip.
 */
export function useQueryOnce<T = DocumentData>(
  refFactory: OnceRefFactory<T>,
  key: string | null,
): OnceResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(key));
  const [status, setStatus] = useState<QueryStatus>(key ? 'pending' : 'pending');

  const refetch = useCallback(async () => {
    if (key === null) return;
    setIsLoading(true);
    setStatus('pending');
    try {
      const snapshot = await getDoc(refFactory() as DocumentReference<DocumentData>);
      setData(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T) : null);
      setError(null);
      setStatus('success');
    } catch (err) {
      logger.error(`useQueryOnce failed (${key})`, err);
      setError(err as Error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, isLoading, error, status, refetch };
}
