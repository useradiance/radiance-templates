import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useEffect, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { getDb } from '@/lib/firestore';
import { useAuthStore } from '@/stores/auth';

const HEARTBEAT_MS = 30_000;

async function writePresence(uid: string, online: boolean) {
  await setDoc(
    doc(getDb(), 'presence', uid),
    { online, lastSeen: serverTimestamp(), updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export function PresenceProvider({ children }: { children: ReactNode }) {
  const uid = useAuthStore((s) => s.user?.uid ?? null);

  useEffect(() => {
    if (!uid) return;
    let timer: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      void writePresence(uid, true);
      timer = setInterval(() => void writePresence(uid, true), HEARTBEAT_MS);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      void writePresence(uid, false);
    };

    start();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') start();
      else stop();
    });

    return () => {
      sub.remove();
      stop();
    };
  }, [uid]);

  return <>{children}</>;
}
