# consent module

Privacy consent: iOS App Tracking Transparency, web cookie-style banner, MMKV-persisted analytics preference.

Install with:

```bash
radiance add consent
```

**Requires:** `analytics`, `i18n`, `theme`

## What it does

- Stores `analytics: boolean | null` in MMKV (`null` = undecided).
- iOS: requests ATT and maps granted → analytics true.
- Web: sticky bottom banner Accept / Decline.
- Provider wraps the tree (auto-wired).

## What it adds

| Path                         | Purpose                                |
| ---------------------------- | -------------------------------------- |
| `stores/consent.ts`          | `useConsentStore`                      |
| `lib/consent-provider.tsx`   | ATT + web banner                       |
| `lib/tracking-permission.ts` | iOS ATT request (`.web.ts` is a no-op) |
| `locales/en.json`            | Consent copy                           |

## Usage

Gate analytics calls:

```ts
const analyticsAllowed = useConsentStore((s) => s.analytics);
if (analyticsAllowed) logEvent('…');
```

## Notes

- Does not automatically disable Firebase Analytics collection — wire `setAnalyticsCollectionEnabled` (or equivalent) when consent changes for production compliance.
- Customize legal copy for your jurisdictions.
