# calendar module

Month calendar UI, RRULE availability slots, Firestore event helpers, and a scheduled reminder job for upcoming events.

Install with:

```bash
radiance add calendar
```

**Requires:** `i18n`, `theme`, `firestore`  
**Side:** `both` (scheduled function copies when `functions` is installed)

## What it does

- Renders a month grid with selection + marked days.
- Computes open booking slots from an iCal RRULE, a daily window, and already-booked intervals.
- Helpers for month boundaries, day matrix, range queries, and event creation.
- About an hour before an `events/{id}` start time, reminds RSVPs (no-ops when that collection is unused).

## What it adds

| Path                                                | Purpose                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `components/MonthCalendar.tsx`                      | Month grid UI                                                                        |
| `lib/calendar.ts`                                   | Date helpers + `eventsInRangeQuery` / `createCalendarEvent` / `isoDatesToMarkedDays` |
| `lib/availability.ts`                               | `slotsOnDay`, `weekdayRRule`, `WEEKDAY_NINE_TO_FIVE` (`rrule`)                       |
| `functions/src/scheduled/upcomingEventReminders.ts` | 15-minute cron for RSVP reminders                                                    |
| `firebase/firestore.rules.fragment`                 | Owner CRUD                                                                           |
| `firebase/firestore.indexes.json`                   | `startsAt` index                                                                     |

## Availability

```ts
import { slotsOnDay, WEEKDAY_NINE_TO_FIVE } from '@/lib/availability';

const slots = slotsOnDay({
  day,
  durationMinutes: 45,
  availability: service.availability ?? WEEKDAY_NINE_TO_FIVE,
  booked: appointments.map((item) => ({
    startsAt: item.startsAt,
    durationMinutes: item.durationMinutes,
  })),
});
```

Default rule: weekdays 09:00–17:00 in 30-minute steps.

## Notes

- Week view is not shipped — compose from `monthDays` / custom lists if needed.
- Booking starter uses this for day picking and slot math; store appointments in `appointments`.
- Event reminders mark `reminderSentAt` on each RSVP so they only fire once.
