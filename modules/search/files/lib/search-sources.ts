import { getDocs } from 'firebase/firestore';

import { keywordQuery, prefixQuery } from '@/lib/search';

export type SearchHit = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  href?: string;
};

export type SearchSource = {
  id: string;
  label?: string;
  /** local | cache | firestore | api — informational; `search` is what runs. */
  kind?: 'local' | 'cache' | 'firestore' | 'api';
  search: (term: string) => Promise<SearchHit[]>;
};

export type GroupedHits = {
  sourceId: string;
  label?: string;
  hits: SearchHit[];
};

function matches(hit: SearchHit, term: string): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return false;
  const hay = `${hit.title} ${hit.subtitle ?? ''}`.toLowerCase();
  return hay.includes(needle);
}

/** Filter an in-memory list (demo data, already-loaded collections, MMKV). */
export function localSource(
  id: string,
  items: SearchHit[] | (() => SearchHit[]),
  label?: string,
): SearchSource {
  return {
    id,
    label,
    kind: 'local',
    search: async (term) => {
      const list = typeof items === 'function' ? items() : items;
      return list.filter((hit) => matches(hit, term)).slice(0, 8);
    },
  };
}

/** Wrap another source with an in-memory TTL cache. */
export function cachedSource(inner: SearchSource, ttlMs = 30_000): SearchSource {
  const cache = new Map<string, { at: number; hits: SearchHit[] }>();
  return {
    id: inner.id,
    label: inner.label,
    kind: 'cache',
    search: async (term) => {
      const key = term.trim().toLowerCase();
      const hit = cache.get(key);
      if (hit && Date.now() - hit.at < ttlMs) return hit.hits;
      const hits = await inner.search(term);
      cache.set(key, { at: Date.now(), hits });
      return hits;
    },
  };
}

/** Firestore prefix query mapped into hits. */
export function firestorePrefixSource(input: {
  id: string;
  collection: string;
  field?: string;
  label?: string;
  map: (id: string, data: Record<string, unknown>) => SearchHit;
  max?: number;
}): SearchSource {
  return {
    id: input.id,
    label: input.label,
    kind: 'firestore',
    search: async (term) => {
      const q = prefixQuery(input.collection, input.field ?? 'nameLower', term, input.max ?? 8);
      if (!q) return [];
      const snap = await getDocs(q);
      return snap.docs.map((doc) => input.map(doc.id, doc.data() as Record<string, unknown>));
    },
  };
}

/** Firestore `searchKeywords` array-contains, mapped into hits. */
export function firestoreKeywordSource(input: {
  id: string;
  collection: string;
  label?: string;
  map: (id: string, data: Record<string, unknown>) => SearchHit;
  max?: number;
}): SearchSource {
  return {
    id: input.id,
    label: input.label,
    kind: 'firestore',
    search: async (term) => {
      const token = term.trim().toLowerCase().split(/\s+/)[0] ?? '';
      const q = keywordQuery(input.collection, token, input.max ?? 8);
      if (!q) return [];
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) =>
        input.map(docSnap.id, docSnap.data() as Record<string, unknown>),
      );
    },
  };
}

/** Remote/callable/Algolia/etc. — you provide the fetch. */
export function apiSource(
  id: string,
  search: (term: string) => Promise<SearchHit[]>,
  label?: string,
): SearchSource {
  return { id, label, kind: 'api', search };
}

export async function searchSources(sources: SearchSource[], term: string): Promise<GroupedHits[]> {
  const trimmed = term.trim();
  if (trimmed.length < 2) return [];
  const groups = await Promise.all(
    sources.map(async (source) => ({
      sourceId: source.id,
      label: source.label,
      hits: await source.search(trimmed).catch(() => []),
    })),
  );
  return groups.filter((group) => group.hits.length > 0);
}
