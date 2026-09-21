import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import { getDb } from '@/lib/firestore';

export type EventItem = {
  id: string;
  title: string;
  description: string;
  startsAt: { seconds: number } | Date;
  venue?: string;
  city?: string;
  coverUrl?: string | null;
  priceInMinorUnits?: number;
  currency?: string;
  organizerId?: string | null;
};

export type EventRsvp = {
  id: string;
  userId: string;
  eventId: string;
  reminderSentAt?: unknown;
};

export function eventsQuery() {
  return query(collection(getDb(), 'events'), orderBy('startsAt', 'asc'));
}

export function myEventsQuery(organizerId: string) {
  return query(
    collection(getDb(), 'events'),
    where('organizerId', '==', organizerId),
    orderBy('startsAt', 'asc'),
  );
}

export function myRsvpsQuery(userId: string) {
  return query(collectionGroup(getDb(), 'rsvps'), where('userId', '==', userId));
}

export function rsvpRef(eventId: string, userId: string) {
  return doc(getDb(), 'events', eventId, 'rsvps', userId);
}

export async function createEvent(input: {
  title: string;
  description: string;
  startsAt: Date;
  venue?: string;
  city?: string;
  coverUrl?: string | null;
  priceInMinorUnits?: number;
  currency?: string;
  organizerId: string;
}): Promise<string> {
  const ref = await addDoc(collection(getDb(), 'events'), {
    title: input.title.trim(),
    description: input.description.trim(),
    startsAt: input.startsAt,
    venue: input.venue?.trim() || null,
    city: input.city?.trim() || null,
    coverUrl: input.coverUrl ?? null,
    priceInMinorUnits: input.priceInMinorUnits ?? 0,
    currency: input.currency ?? 'usd',
    organizerId: input.organizerId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function rsvp(eventId: string, userId: string) {
  await setDoc(doc(getDb(), 'events', eventId, 'rsvps', userId), {
    userId,
    eventId,
    createdAt: serverTimestamp(),
  });
}
