import { RRule, rrulestr, Weekday, type WeekdayStr } from 'rrule';

export type AvailabilityRule = {
  /** iCal RRULE, e.g. `FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR`. Empty = every day. */
  rrule?: string | null;
  /** Inclusive window start, `HH:mm` in local time. */
  windowStart: string;
  /** Exclusive window end, `HH:mm` in local time. */
  windowEnd: string;
  /** Step between slot start times. Defaults to the service duration. */
  slotMinutes?: number;
};

export type BookedInterval = {
  startsAt: Date;
  durationMinutes: number;
};

export const WEEKDAY_NINE_TO_FIVE: AvailabilityRule = {
  rrule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
  windowStart: '09:00',
  windowEnd: '17:00',
  slotMinutes: 30,
};

function parseHm(value: string): { hours: number; minutes: number } {
  const [hours, minutes] = value.split(':').map((part) => Number(part));
  return { hours: hours || 0, minutes: minutes || 0 };
}

function atTime(day: Date, hm: string): Date {
  const { hours, minutes } = parseHm(hm);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes, 0, 0);
}

/**
 * JS `getDay()` is 0=Sun…6=Sat. rrule weekdays are 0=Mon…6=Sun.
 */
function jsDayToRRule(jsDay: number): number {
  return (jsDay + 6) % 7;
}

function rruleWeekdayIndex(entry: number | Weekday | WeekdayStr): number {
  if (typeof entry === 'number') return entry;
  if (typeof entry === 'string') return Weekday.fromStr(entry).weekday;
  return entry.weekday;
}

function dayMatchesRule(day: Date, rrule: string | null | undefined): boolean {
  if (!rrule?.trim()) return true;
  const body = rrule.replace(/^RRULE:/i, '').trim();
  try {
    const parsed = RRule.parseString(body);
    if (parsed.byweekday != null) {
      const wanted = new Set(
        (Array.isArray(parsed.byweekday) ? parsed.byweekday : [parsed.byweekday]).map((entry) =>
          rruleWeekdayIndex(entry),
        ),
      );
      return wanted.has(jsDayToRRule(day.getDay()));
    }
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
    const rule = rrulestr(`RRULE:${body}`, { dtstart: start });
    return rule.between(start, end, true).length > 0;
  } catch {
    return false;
  }
}

function overlaps(slot: Date, durationMinutes: number, booked: BookedInterval): boolean {
  const slotEnd = slot.getTime() + durationMinutes * 60_000;
  const bookEnd = booked.startsAt.getTime() + booked.durationMinutes * 60_000;
  return slot.getTime() < bookEnd && booked.startsAt.getTime() < slotEnd;
}

/**
 * Open slot start times for `day`, after applying an RRULE (which days), a daily
 * window, and already-booked intervals.
 */
export function slotsOnDay(input: {
  day: Date;
  durationMinutes: number;
  availability: AvailabilityRule;
  booked?: BookedInterval[];
  now?: Date;
}): Date[] {
  const { day, durationMinutes, availability } = input;
  const booked = input.booked ?? [];
  const now = input.now ?? new Date();
  if (!dayMatchesRule(day, availability.rrule)) return [];

  const step = availability.slotMinutes ?? durationMinutes;
  if (step <= 0 || durationMinutes <= 0) return [];

  const windowStart = atTime(day, availability.windowStart);
  const windowEnd = atTime(day, availability.windowEnd);
  const lastStart = new Date(windowEnd.getTime() - durationMinutes * 60_000);
  const slots: Date[] = [];

  for (let cursor = windowStart.getTime(); cursor <= lastStart.getTime(); cursor += step * 60_000) {
    const slot = new Date(cursor);
    if (slot.getTime() < now.getTime()) continue;
    if (booked.some((item) => overlaps(slot, durationMinutes, item))) continue;
    slots.push(slot);
  }

  return slots;
}

export function weekdayRRule(days = ['MO', 'TU', 'WE', 'TH', 'FR']): string {
  return `FREQ=WEEKLY;BYDAY=${days.join(',')}`;
}

export function formatSlotTime(slot: Date): string {
  return slot.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
