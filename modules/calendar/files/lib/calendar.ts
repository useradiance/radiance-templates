import { addDoc, collection, orderBy, query, where, type Query } from 'firebase/firestore';

import { getDb } from '@/lib/firestore';

export type CalendarEvent = {
  id: string;
  title: string;
  startsAt: { seconds: number };
  endsAt?: { seconds: number } | null;
  ownerId?: string;
  allDay?: boolean;
};

/** MonthCalendar `markedDays` key — month is 0-based. */
export function calendarDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** Convert `YYYY-MM-DD` history strings into MonthCalendar `markedDays` keys. */
export function isoDatesToMarkedDays(isoDates: string[]): Set<string> {
  const marked = new Set<string>();
  for (const iso of isoDates) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!match) continue;
    marked.add(`${Number(match[1])}-${Number(match[2]) - 1}-${Number(match[3])}`);
  }
  return marked;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function monthDays(anchor: Date): Date[] {
  const first = startOfMonth(anchor);
  const startWeekday = first.getDay();
  const days: Date[] = [];
  for (let i = 0; i < startWeekday; i++) {
    const d = new Date(first);
    d.setDate(d.getDate() - (startWeekday - i));
    days.push(d);
  }
  const last = endOfMonth(anchor).getDate();
  for (let day = 1; day <= last; day++) {
    days.push(new Date(anchor.getFullYear(), anchor.getMonth(), day));
  }
  while (days.length % 7 !== 0) {
    const d = new Date(days[days.length - 1]);
    d.setDate(d.getDate() + 1);
    days.push(d);
  }
  return days;
}

export function eventsInRangeQuery(from: Date, to: Date): Query {
  return query(
    collection(getDb(), 'calendarEvents'),
    where('startsAt', '>=', from),
    where('startsAt', '<=', to),
    orderBy('startsAt', 'asc'),
  );
}

export async function createCalendarEvent(input: {
  title: string;
  startsAt: Date;
  endsAt?: Date;
  ownerId: string;
}): Promise<string> {
  const ref = await addDoc(collection(getDb(), 'calendarEvents'), {
    title: input.title,
    startsAt: input.startsAt,
    endsAt: input.endsAt ?? null,
    ownerId: input.ownerId,
    createdAt: new Date(),
  });
  return ref.id;
}
