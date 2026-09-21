# locale-picker module

Language preference UI in Settings: follow system locale or pin an explicit language.

Install with:

```bash
radiance add locale-picker
```

**Requires:** `i18n`, `theme`, `navigation`

## What it does

- Splices `LocaleSettingsSection` into navigation settings screens (same markers as `settings` / `auth`).
- Persists preference with MMKV (`stores/locale.ts`).
- Updates i18next language when preference changes.

## What it adds

| Path                                        | Purpose                  |
| ------------------------------------------- | ------------------------ |
| `components/i18n/LocaleSettingsSection.tsx` | System + per-locale rows |
| `stores/locale.ts`                          | Preference store         |
| `locales/en.json`                           | Locale picker copy       |

## Wiring

Markers target:

- `app/(app)/(tabs)/settings.tsx`
- `app/(app)/(drawer)/settings.tsx`
- `app/(app)/settings.tsx`

## Notes

- Supported locales come from the `i18n` module registry — add translation JSON files when expanding languages.
- Installed automatically when init selects multiple locales.
