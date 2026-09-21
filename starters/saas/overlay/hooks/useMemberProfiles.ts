import { documentId, collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';

import { getDb } from '@/lib/firestore';

export type MemberProfile = {
  uid: string;
  displayName: string;
  email?: string | null;
  photoURL?: string | null;
};

/**
 * Loads `users/{uid}` profiles for a workspace member list.
 * Missing profiles fall back to a short uid label (demo seats / not-yet-signed-in).
 */
export function useMemberProfiles(memberIds: string[]): {
  profiles: MemberProfile[];
  isLoading: boolean;
} {
  const key = useMemo(() => [...memberIds].sort().join(','), [memberIds]);
  const [profiles, setProfiles] = useState<MemberProfile[]>([]);
  const [isLoading, setIsLoading] = useState(memberIds.length > 0);

  useEffect(() => {
    let cancelled = false;
    if (memberIds.length === 0) {
      setProfiles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const chunks: string[][] = [];
    for (let i = 0; i < memberIds.length; i += 10) {
      chunks.push(memberIds.slice(i, i + 10));
    }

    void Promise.all(chunks.map((chunk) => fetchChunk(chunk)))
      .then((rows) => {
        if (cancelled) return;
        const byId = new Map<string, MemberProfile>();
        for (const row of rows.flat()) byId.set(row.uid, row);
        setProfiles(
          memberIds.map(
            (uid) =>
              byId.get(uid) ?? {
                uid,
                displayName: fallbackLabel(uid),
              },
          ),
        );
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setProfiles(memberIds.map((uid) => ({ uid, displayName: fallbackLabel(uid) })));
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // key captures membership; memberIds identity is unstable as a dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { profiles, isLoading };
}

function fallbackLabel(uid: string): string {
  if (uid.startsWith('demo-')) {
    return uid.replace(/^demo-/, '').replace(/^\w/, (c) => c.toUpperCase());
  }
  return `${uid.slice(0, 6)}…`;
}

async function fetchChunk(chunk: string[]): Promise<MemberProfile[]> {
  const snap = await getDocs(query(collection(getDb(), 'users'), where(documentId(), 'in', chunk)));
  return snap.docs.map((entry) => {
    const data = entry.data();
    return {
      uid: entry.id,
      displayName:
        (typeof data.displayName === 'string' && data.displayName) ||
        (typeof data.email === 'string' && data.email) ||
        fallbackLabel(entry.id),
      email: typeof data.email === 'string' ? data.email : null,
      photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
    };
  });
}
