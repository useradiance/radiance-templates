# events starter

Event listings with detail, RSVP, shareable deep links, calendar + Stripe + push installed.

```bash
radiance init my-events --template events
```

**Extends:** `expo-app`  
**Default theme pack:** `branded`

## Who it is for

Conferences, meetups, ticketed or free RSVP events.

## Modules installed

| Module                                                 | Role                     |
| ------------------------------------------------------ | ------------------------ |
| Core + `auth`, `firestore`, `forms`                    | App                      |
| `calendar`                                             | Date UI / event helpers  |
| `share`, `deep-linking`                                | Share event URLs         |
| `stripe`                                               | Paid tickets             |
| `push-notifications`                                   | Event reminders          |
| `barcode`                                              | Ticket QR + door scanner |
| `functions`, `callable-client`, `hosting`, `analytics` | Backend + web            |

## Overlay

| Path                                    | Purpose                          |
| --------------------------------------- | -------------------------------- |
| `overlay/app/(app)/(tabs)/index.tsx`    | Event list                       |
| `overlay/app/(app)/(tabs)/host.tsx`     | Create events + door link        |
| `overlay/app/(app)/door.tsx`            | QR scanner for tickets           |
| `overlay/app/(app)/event/[eventId].tsx` | Detail, RSVP, ticket QR, share   |
| `overlay/lib/event-items.ts`            | `eventsQuery`, `rsvp`            |
| `overlay/lib/registry/tabs.ts`          | Tabs                             |
| `overlay/locales/en.json`               | Copy                             |
| `firebase/firestore.rules.fragment`     | Public event read; RSVP per user |

## Data model

| Path                         | Shape                                        |
| ---------------------------- | -------------------------------------------- |
| `events/{id}`                | `title`, `description`, `startsAt`, `venue?` |
| `events/{id}/rsvps/{userId}` | RSVP doc                                     |

## Key behaviours

- Organizers create events (`organizerId == uid`).
- RSVP shows a door QR (`radiance-ticket:{eventId}:{userId}`).
- Scheduled reminders (~1 hour before) go to RSVPs via the calendar module.

## Next steps

```bash
radiance add roles
```
