# force-update module

Blocks the app when the installed version is below Remote Config `min_app_version`.

Install with:

```bash
radiance add force-update
```

**Requires:** `i18n`, `theme`, `remote-config`

## What it does

- Compares `expo-application` / Expo config version to `min_app_version`.
- When outdated, renders a full-screen update CTA instead of children.
- Registered as a root provider gate.
- **Web:** Update now reloads the page and treats that reload as having fetched `min_app_version` (until Remote Config raises it again). Native still requires a store URL.

## What it adds

| Path                             | Purpose                                  |
| -------------------------------- | ---------------------------------------- |
| `lib/version.ts`                 | `getInstalledVersion`, `compareVersions` |
| `components/ForceUpdateGate.tsx` | Blocking gate UI                         |
| `locales/en.json`                | Update required copy                     |

## Usage

Automatic after install (provider wraps the tree). Optional store URL override:

```tsx
<ForceUpdateGate storeUrl="https://apps.apple.com/...">{children}</ForceUpdateGate>
```

Or set:

- `EXPO_PUBLIC_IOS_STORE_URL`
- `EXPO_PUBLIC_ANDROID_STORE_URL`
- `EXPO_PUBLIC_WEB_UPDATE_URL` (optional; web reloads the page when unset)

On native, a missing store URL shows a toast instead of a silent no-op.

## Version format

Semver-ish numeric segments (`1.2.3`). Prefix `v` is stripped. Pre-release suffixes are ignored for comparison segments.

## Setup checklist

1. Install `remote-config` and set `min_app_version` in the console.
2. Bump `version` in `app.config` / store listings consistently.
3. Test by temporarily setting `min_app_version` above the installed build.
