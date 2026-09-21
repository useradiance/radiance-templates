# connectivity module

Network online/offline banner using NetInfo (complements Firestore `SyncBanner`).

Install with:

```bash
radiance add connectivity
```

**Requires:** `i18n`, `theme`

## What it does

- Subscribes to `@react-native-community/netinfo`.
- Shows a top banner when disconnected / internet unreachable.
- Can wrap the tree as a provider (passes children through).

## What it adds

| Path                                | Purpose                            |
| ----------------------------------- | ---------------------------------- |
| `components/ConnectivityBanner.tsx` | Banner + optional children wrapper |
| `locales/en.json`                   | Offline message                    |

## Usage

Automatic if wired as a provider. Or place manually:

```tsx
<ConnectivityBanner />
```

## Notes

- Firestore sync status is separate (`SyncBanner` in `firestore`) — use both for full offline UX.
