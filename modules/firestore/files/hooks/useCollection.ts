import { onSnapshot, type DocumentData, type Query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { isIndexBuildingError } from '@/hooks/firestore-errors';
import { logger } from '@/lib/logger';
import { useSyncStore } from '@/stores/sync';

export type QueryStatus = 'pending' | 'success' | 'error';

export type CollectionResult<T> = {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  /** True while the data comes from the local cache and has not been confirmed by the server. */
  fromCache: boolean;
  status: QueryStatus;
};

type Subscription<T> = CollectionResult<T> & { key: string };

function pending<T>(key: string): Subscription<T> {
  return { key, data: [], isLoading: true, error: null, fromCache: false, status: 'pending' };
}

/** Accepts typed helpers or raw `query(collection(...))` — Firestore queries are invariant in T. */
export type QueryFactory<T> = () => Query<T> | Query<DocumentData>;

const INDEX_RETRY_MS = 2500;
const INDEX_RETRY_MAX_MS = 15000;

/**
 * Subscribes to a Firestore query and keeps the result in state.
 *
 * `key` is the identity of the query: the subscription is rebuilt whenever it changes, and a
 * `null` key skips the subscription altogether — which is what you want before a user id or a
 * route parameter is known.
 *
 * ```ts
 * const { data, status, fromCache } = useCollection<Post>(() => feedQuery(), 'posts:feed');
 * ```
 */
export function useCollection<T = DocumentData>(
  queryFactory: QueryFactory<T>,
  key: string | null,
): CollectionResult<T> {
  const [state, setState] = useState<Subscription<T>>(() => pending<T>(key ?? ''));
  const reportSnapshot = useSyncStore((store) => store.reportSnapshot);

  useEffect(() => {
    if (key === null) return;

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let delay = INDEX_RETRY_MS;

    const subscribe = () => {
      const q = queryFactory() as Query<DocumentData>;
      unsubscribe = onSnapshot(
        q,
        { includeMetadataChanges: true },
        (snapshot) => {
          setState({
            key,
            data: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T),
            isLoading: false,
            error: null,
            fromCache: snapshot.metadata.fromCache,
            status: 'success',
          });
          reportSnapshot(snapshot.metadata);
        },
        (error) => {
          if (cancelled) return;
          if (isIndexBuildingError(error)) {
            logger.warn(`useCollection waiting for index (${key})`);
            setState(pending<T>(key));
            unsubscribe?.();
            retryTimer = setTimeout(() => {
              delay = Math.min(delay * 1.5, INDEX_RETRY_MAX_MS);
              subscribe();
            }, delay);
            return;
          }
          logger.error(`useCollection failed (${key})`, error);
          setState({
            key,
            data: [],
            isLoading: false,
            error,
            fromCache: false,
            status: 'error',
          });
        },
      );
    };

    subscribe();
    return () => {
      cancelled = true;
      unsubscribe?.();
      if (retryTimer) clearTimeout(retryTimer);
    };
    // The factory is deliberately not a dependency — `key` describes what it builds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, reportSnapshot]);

  if (key === null) {
    return { data: [], isLoading: false, error: null, fromCache: false, status: 'pending' };
  }

  // A changed key means whatever is in state belongs to the previous query.
  return state.key === key ? state : pending<T>(key);
}
