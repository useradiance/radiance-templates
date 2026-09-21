# booking starter

Service catalogue + calendar day picker → appointment booking, with Stripe and push installed for deposits / reminders.

```bash
radiance init my-bookings --template booking
```

**Extends:** `expo-app`  
**Default theme pack:** `branded`

## Who it is for

Salons, clinics, consultants — book a service on a day/time.

## Modules installed

| Module                                                 | Role                            |
| ------------------------------------------------------ | ------------------------------- |
| Core + `auth`, `firestore`, `forms`                    | App shell                       |
| `calendar`                                             | `MonthCalendar` + event helpers |
| `stripe`                                               | Deposits / paid bookings        |
| `push-notifications`                                   | Reminder hooks                  |
| `functions`, `callable-client`, `hosting`, `analytics` | Backend + web                   |

## Overlay

| Path                                     | Purpose                                       |
| ---------------------------------------- | --------------------------------------------- |
| `overlay/app/(app)/(tabs)/index.tsx`     | Services list                                 |
| `overlay/app/(app)/book/[serviceId].tsx` | Day picker + confirm                          |
| `overlay/lib/booking.ts`                 | `servicesQuery`, `bookAppointment`            |
| `overlay/lib/registry/tabs.ts`           | Tabs                                          |
| `overlay/locales/en.json`                | Copy                                          |
| `firebase/firestore.rules.fragment`      | Services (admin write) / appointments (owner) |

## Data model

| Path                | Shape                                                      |
| ------------------- | ---------------------------------------------------------- |
| `services/{id}`     | `name`, `durationMinutes`, `priceInMinorUnits`, `currency` |
| `appointments/{id}` | `serviceId`, `userId`, `startsAt`, `status`                |

Default slot times come from `slotsOnDay` (weekday RRULE 09:00–17:00 minus overlapping appointments).

## Key behaviours

- Seed `services` as admin (or console), including optional `availability.rrule`.
- Open slots subtract other bookings for that service on the selected day.

## Next steps

```bash
radiance add roles       # staff calendars
radiance add places      # multi-location
```
