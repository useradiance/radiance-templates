import {
  addDoc,
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  where,
  type DocumentReference,
} from 'firebase/firestore';

import type { AvailabilityRule } from '@/lib/availability';
import { getDb } from '@/lib/firestore';

export type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  priceInMinorUnits: number;
  currency: string;
  imageUrl?: string | null;
  rating?: number;
  category?: string;
  availability?: AvailabilityRule | null;
};

export type Appointment = {
  id: string;
  serviceId: string;
  userId: string;
  startsAt: Date | { seconds: number } | string;
  durationMinutes?: number;
  status: 'booked' | 'cancelled';
};

export function asDate(value: Appointment['startsAt'] | unknown): Date {
  if (value instanceof Date) return value;
  if (
    value &&
    typeof value === 'object' &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (
    value &&
    typeof value === 'object' &&
    typeof (value as { seconds?: number }).seconds === 'number'
  ) {
    return new Date((value as { seconds: number }).seconds * 1000);
  }
  return new Date(String(value));
}

export function servicesQuery() {
  return query(collection(getDb(), 'services'), orderBy('name', 'asc'));
}

export function serviceRef(serviceId: string): DocumentReference {
  return doc(getDb(), 'services', serviceId);
}

export function appointmentsQuery(userId: string) {
  return query(
    collection(getDb(), 'appointments'),
    where('userId', '==', userId),
    orderBy('startsAt', 'asc'),
  );
}

export function appointmentsForServiceOnDay(serviceId: string, day: Date) {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
  return query(
    collection(getDb(), 'appointments'),
    where('serviceId', '==', serviceId),
    where('startsAt', '>=', start),
    where('startsAt', '<=', end),
    orderBy('startsAt', 'asc'),
  );
}

export async function bookAppointment(input: {
  serviceId: string;
  userId: string;
  startsAt: Date;
  durationMinutes: number;
}): Promise<string> {
  const ref = await addDoc(collection(getDb(), 'appointments'), {
    ...input,
    status: 'booked',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
