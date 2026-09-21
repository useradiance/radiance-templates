import { onSnapshot, type DocumentData, type DocumentReference } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import type { QueryStatus } from '@/hooks/useCollection';
import { isIndexBuildingError } from '@/hooks/firestore-errors';
import { logger } from '@/lib/logger';
import { useSyncStore } from '@/stores/sync';

export type DocumentResult<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  fromCache: boolean;
  status: QueryStatus;
};

/** Accepts typed helpers (`postRef`) or raw `doc(...)` — Firestore refs are invariant in T. */
export type DocumentRefFactory<T> = () => DocumentReference<T> | DocumentReference<DocumentData>;

type Subscription<T> = DocumentResult<T> & { key: string };

function pending<T>(key: string): Subscription<T> {
  return { key, data: null, isLoading: true, error: null, fromCache: false, status: 'pending' };
}

const INDEX_RETRY_MS = 2500;
const INDEX_RETRY_MAX_MS = 15000;

/**
 * Subscribes to a single Firestore document.
 *
 * Like `useCollection`, `key` identifies the document and a `null` key skips the subscription.
 *
 * Prefer typed helpers (`productRef`, `postRef`) when the project defines them. Raw `doc(...)`
 * refs are also accepted so `useDocument<Post>(() => doc(db, 'posts', id), …)` typechecks.
 *
 * ```ts
 * const { data: product, status } = useDocument<Product>(() => productRef(id), id && `products:${id}`);
 * ```
 */
export function useDocument<T = DocumentData>(
  refFactory: DocumentRefFactory<T>,
  key: string | null,
): DocumentResult<T> {
  const [state, setState] = useState<Subscription<T>>(() => pending<T>(key ?? ''));
  const reportSnapshot = useSyncStore((store) => store.reportSnapshot);

  useEffect(() => {
    if (key === null) return;

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let delay = INDEX_RETRY_MS;

    const subscribe = () => {
      const ref = refFactory() as DocumentReference<DocumentData>;
      unsubscribe = onSnapshot(
        ref,
        { includeMetadataChanges: true },
        (snapshot) => {
          setState({
            key,
            data: snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T) : null,
            isLoading: false,
            error: null,
            fromCache: snapshot.metadata.fromCache,
            status: 'success',
          });
          reportSnapshot(snapshot.metadata);
        },
        (error: Error) => {
          if (cancelled) return;
          if (isIndexBuildingError(error)) {
            logger.warn(`useDocument waiting for index (${key})`);
            setState(pending<T>(key));
            unsubscribe?.();
            retryTimer = setTimeout(() => {
              delay = Math.min(delay * 1.5, INDEX_RETRY_MAX_MS);
              subscribe();
            }, delay);
            return;
          }
          logger.error(`useDocument failed (${key})`, error);
          setState({
            key,
            data: null,
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
    return { data: null, isLoading: false, error: null, fromCache: false, status: 'pending' };
  }

  return state.key === key ? state : pending<T>(key);
}
