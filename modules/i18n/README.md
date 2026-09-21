# i18n module

Internationalisation and localisation for every Radiance app.

## What it adds

- `lib/i18n.tsx` — i18next setup, device-locale detection, `I18nProvider`, `changeLocale`
- `lib/format.ts` — locale-aware date, relative time, number and currency formatting
- Registers `I18nProvider` in `lib/registry/providers.tsx`

## Usage

```tsx
import { useTranslation } from 'react-i18next';

export function Greeting() {
  const { t } = useTranslation();
  return <Text>{t('common.appName')}</Text>;
}
```

## Adding a language

1. Create `locales/de.json` with the same shape as `locales/en.json`.
2. Register it between the `radiance:locales` markers in `lib/i18n.tsx`:

```ts
export const resources = {
  en: { translation: en },
  // radiance:locales:start
  de: { translation: de },
  // radiance:locales:end
};
```

During `radiance init` (prompt mode) you can multi-select locales; the CLI clones
`en.json`, registers each code, and can optionally LLM-translate. Add
`locale-picker` for a Settings language switcher.

## Rules

- No user-facing string literals in components — everything goes through `t()`.
- New copy must be added to `locales/en.json`; other locales fall back to it.
- Right-to-left layout is enabled from the device locale at startup. Switching direction at
  runtime requires an app reload on native.
