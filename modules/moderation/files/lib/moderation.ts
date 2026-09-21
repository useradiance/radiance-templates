import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { call } from '@/lib/callable';
import { getDb } from '@/lib/firestore';

export async function reportContent(input: {
  targetPath: string;
  reason: string;
  reporterId: string;
}): Promise<string> {
  const ref = await addDoc(collection(getDb(), 'reports'), {
    ...input,
    status: 'open',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function resolveReport(
  reportId: string,
  resolution: 'dismissed' | 'actioned',
): Promise<void> {
  await call('resolveReport', { reportId, resolution });
}
