import { doc } from 'firebase/firestore';

import { useDocument } from '@/hooks/useDocument';
import { getDb } from '@/lib/firestore';

export type Presence = {
  online: boolean;
  lastSeen?: { seconds: number } | null;
};

export function usePresence(uid: string | null) {
  return useDocument<Presence>(
    () => doc(getDb(), 'presence', uid!),
    uid ? `presence:${uid}` : null,
  );
}
