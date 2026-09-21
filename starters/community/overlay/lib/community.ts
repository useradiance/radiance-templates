import { addDoc, collection, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firestore';

export type Channel = { id: string; name: string; description?: string; nameLower?: string };
export type Thread = {
  id: string;
  channelId: string;
  title: string;
  authorId: string;
  createdAt?: { seconds: number } | null;
};

export function channelsQuery() {
  return query(collection(getDb(), 'channels'), orderBy('name', 'asc'));
}

export function threadsQuery(channelId: string) {
  return query(collection(getDb(), 'channels', channelId, 'threads'), orderBy('createdAt', 'desc'));
}

export async function createThread(channelId: string, title: string, authorId: string) {
  const ref = await addDoc(collection(getDb(), 'channels', channelId, 'threads'), {
    channelId,
    title: title.trim(),
    authorId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
