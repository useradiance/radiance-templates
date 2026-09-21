# firestore module

Offline-first Cloud Firestore access with optimistic writes.

## What it adds

- `lib/firestore.ts` — single `getDb()` entry point, cache configuration, emulator wiring
- `lib/optimistic.ts` — `optimisticUpdate()` and `createLocalId()`
- `hooks/useCollection.ts`, `hooks/useDocument.ts` — realtime subscriptions with cache state
- `stores/sync.ts` — offline / pending-write state
- `components/SyncBanner.tsx` — banner shown while offline or saving

## Reading data

```ts
const { data, isLoading } = useCollection<Post>(
  () => query(collection(getDb(), 'posts'), orderBy('createdAt', 'desc'), limit(50)),
  'posts:feed',
);
```

The second argument identifies the query. The subscription is rebuilt when it changes, and a
`null` key skips subscribing — use it while a user id or route parameter is still unknown:

```ts
const { data } = useCollection<Post>(
  () => authorPostsQuery(uid!),
  uid ? `posts:author:${uid}` : null,
);
```

## Writing data

```ts
await optimisticUpdate({
  localApply: () => usePostStore.getState().addLocal(draft),
  remoteWrite: () => setDoc(doc(getDb(), 'posts', draft.id), draft),
  rollback: () => usePostStore.getState().removeLocal(draft.id),
});
```

## Caching behaviour

| Platform    | Cache                    | Survives restart | Offline writes         |
| ----------- | ------------------------ | ---------------- | ---------------------- |
| Web         | IndexedDB, multi-tab     | Yes              | Queued and flushed     |
| iOS/Android | In-memory (JS SDK limit) | No               | Queued for the session |

If cross-restart caching on native becomes a requirement, persist the relevant slices in a
Zustand store backed by AsyncStorage rather than switching SDKs.

## Rules and indexes

Add collection rules as a fragment inside your feature module (`firebase/firestore.rules.fragment`)
and composite indexes in `firebase/firestore.indexes.json`. Radiance merges both into the
project on install.
