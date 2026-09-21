# settings module

Shared Settings chrome: appearance preference UI that splices into the navigation settings screens.

Install with:

```bash
radiance add settings
```

**Requires:** `i18n`, `theme`, `navigation`  
**Always installed** with the `expo-app` scaffold (requiredModules), so every app gets one Appearance section without navigation hard-coding a second copy.

## What it does

- Adds an **Appearance** section (System / Light / Dark) backed by the theme module's MMKV appearance store.
- Wires into the same `radiance:settings` markers that `auth` and `locale-picker` use, so Settings screens compose sections without hand-editing layouts.

## What it adds

| Path                                                | Purpose                                                |
| --------------------------------------------------- | ------------------------------------------------------ |
| `components/settings/AppearanceSettingsSection.tsx` | List of appearance options with checkmark selection    |
| `components/settings/SettingsLayout.tsx`            | Phone stack / desktop columns without overlapping flex |
| `locales/en.json`                                   | `settings.appearance*` strings                         |

## Wiring

On install, markers insert `<AppearanceSettingsSection />` into:

- `app/(app)/(tabs)/settings.tsx`
- `app/(app)/(drawer)/settings.tsx`
- `app/(app)/settings.tsx`

## Usage

No direct API — open the Settings tab after install. Pair with:

- `locale-picker` for language
- `auth` for account / sign-out / delete-account rows
- `push-notifications` for notification permission UX (add your own section)

## Notes

- Appearance preference is persisted by `stores/appearance.ts` from the `theme` module.
- This module does **not** own the settings route itself — `navigation` does.
