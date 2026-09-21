# presence module

Online / last-seen heartbeat written to Firestore while the app is foregrounded.

Install with:

```bash
radiance add presence
```

**Requires:** `auth`, `firestore`, `i18n`

## What it does

- On sign-in, writes `presence/{uid}` every 30s and on AppState active.
- Marks `online: false` on background / unmount.
- `usePresence(uid)` reads another user's presence doc.

## What it adds

| Path                                | Purpose                         |
| ----------------------------------- | ------------------------------- |
| `lib/presence-provider.tsx`         | Heartbeat provider (auto-wired) |
| `hooks/usePresence.ts`              | Subscribe to a user's presence  |
| `firebase/firestore.rules.fragment` | Self-write; signed-in read      |

## Data model

```
presence/{uid}
  online: boolean
  lastSeen: Timestamp
  updatedAt: Timestamp
```

## Usage

```tsx
const { data } = usePresence(otherUid);
// data?.online, data?.lastSeen
```

## Notes

- Not a perfect realtime presence system (heartbeat interval + client trust). For stricter presence, consider RTDB `.info/connected` patterns later.
- Deploy rules before enabling in production.
