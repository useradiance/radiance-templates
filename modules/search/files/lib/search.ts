import {
  collection,
  limit,
  orderBy,
  query,
  startAt,
  endAt,
  where,
  type Query,
  type DocumentData,
} from 'firebase/firestore';

import { getDb } from '@/lib/firestore';

/** Prefix query on a lowercase string field (e.g. nameLower). */
export function prefixQuery(
  collectionPath: string,
  field: string,
  term: string,
  max = 20,
): Query<DocumentData> | null {
  const trimmed = term.trim().toLowerCase();
  if (!trimmed) return null;
  const col = collection(getDb(), collectionPath);
  return query(col, orderBy(field), startAt(trimmed), endAt(`${trimmed}\uf8ff`), limit(max));
}

/** Keyword array-contains search (documents need searchKeywords: string[]). */
export function keywordQuery(
  collectionPath: string,
  keyword: string,
  max = 20,
): Query<DocumentData> | null {
  const trimmed = keyword.trim().toLowerCase();
  if (!trimmed) return null;
  return query(
    collection(getDb(), collectionPath),
    where('searchKeywords', 'array-contains', trimmed),
    limit(max),
  );
}

export function tokenizeForSearch(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length >= 2),
    ),
  );
}
