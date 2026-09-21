# habits starter

Daily habit tracking with streaks, tap-to-check-in, and push/analytics installed for reminders.

```bash
radiance init my-habits --template habits
```

**Extends:** `expo-app`  
**Default theme pack:** `ocean`

## Who it is for

Personal habit / streak apps (lighter than full `productivity` projects).

## Modules installed

| Module                              | Role               |
| ----------------------------------- | ------------------ |
| Core + `auth`, `firestore`, `forms` | App                |
| `calendar`                          | History month grid |
| `push-notifications`                | Reminder hooks     |
| `analytics`, `hosting`              | Metrics + web      |

## Overlay

| Path                                 | Purpose                      |
| ------------------------------------ | ---------------------------- |
| `overlay/app/(app)/(tabs)/index.tsx` | Habit list, create, check-in |
| `overlay/lib/habits.ts`              | CRUD + streak logic          |
| `overlay/lib/registry/tabs.ts`       | Tabs                         |
| `overlay/locales/en.json`            | Copy                         |
| `firebase/firestore.rules.fragment`  | Owner-only habits            |

## Data model

| Path          | Shape                                                                    |
| ------------- | ------------------------------------------------------------------------ |
| `habits/{id}` | `ownerId`, `name`, `streak`, `lastCheckInDate` (YYYY-MM-DD), `checkIns?` |

## Key behaviours

- Tap a habit to check in for today; streak continues if yesterday was checked, else resets to 1.
- History calendar marks `history[]` days (`YYYY-MM-DD`).
- Optional daily local reminder hour when creating a habit.

## Next steps

```bash
radiance add in-app-review   # after a long streak
radiance add widgets         # (custom) home-screen glance
```
