# remote-config module

Typed Firebase Remote Config with defaults, fetch-and-activate on launch, and React hooks for flags / copy.

Install with:

```bash
radiance add remote-config
```

**Requires:** none (pairs with `force-update`, `analytics`)

## What it does

- Defines `REMOTE_CONFIG_DEFAULTS` as the source of truth for keys/types.
- Fetches and activates Remote Config (JS SDK on web, RNFirebase on native).
- Exposes `useRemoteConfig()` and `useRemoteFlag(key)` via a provider.

## What it adds

| Path                                 | Purpose                 |
| ------------------------------------ | ----------------------- |
| `lib/remote-config.ts`               | Default key map + types |
| `lib/remote-config-client.ts`        | Web / JS SDK fetch      |
| `lib/remote-config-client.native.ts` | RNFirebase fetch        |
| `lib/remote-config-provider.tsx`     | Provider + hooks        |

## Default keys

| Key                       | Type    | Purpose                    |
| ------------------------- | ------- | -------------------------- |
| `min_app_version`         | string  | Consumed by `force-update` |
| `feature_billing_enabled` | boolean | Example kill switch        |
| `welcome_banner`          | string  | Example remote copy        |

Edit defaults in `lib/remote-config.ts` and mirror keys in the Firebase console.

## Usage

```tsx
const { welcome_banner } = useRemoteConfig();
const billingOn = useRemoteFlag('feature_billing_enabled');
```

## Setup checklist

1. Firebase console → Remote Config → create matching parameters.
2. Native builds need `google-services` / `GoogleService-Info.plist` and a development build for RNFirebase.
3. In `__DEV__`, minimum fetch interval is `0` for faster iteration.

## Notes

- Failed fetches keep defaults — the app remains usable offline / misconfigured.
- Wire the provider is automatic via `wire.providers`.
