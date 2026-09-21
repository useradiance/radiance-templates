# navigation module

Expo Router structure with signed-out `(auth)` and signed-in `(app)` groups, AuthGate / GuestGate, and a selectable app shell.

Install / reconfigure:

```bash
radiance add navigation --option shell=tabs    # default
radiance add navigation --option shell=drawer
radiance add navigation --option shell=stack
```

**Requires:** `i18n`, `theme`  
**Always installed** with the `expo-app` scaffold (requiredModules).

## What it does

- Defines route groups and guards so unauthenticated users cannot enter `(app)`.
- Offers three chrome variants: bottom tabs, drawer, or plain stack.
- Exposes a tab/drawer registry (`lib/registry/tabs.ts`) that starters overlay.

## Shells

| Shell    | Layout                                                          |
| -------- | --------------------------------------------------------------- |
| `tabs`   | Bottom tabs under `(tabs)` + stack siblings for detail routes   |
| `drawer` | Side drawer under `(drawer)` + stack siblings for detail routes |
| `stack`  | Simple stack (home + settings)                                  |

When the shell is drawer or stack, Radiance remaps starter paths from `app/(app)/(tabs)/` onto `(drawer)/` or flat `(app)/` automatically.

## What it adds (representative)

| Path                                    | Purpose                                                          |
| --------------------------------------- | ---------------------------------------------------------------- |
| `lib/registry/AuthGate.tsx`             | Redirect guests to sign-in                                       |
| `lib/registry/GuestGate.tsx`            | Redirect signed-in users away from auth screens                  |
| `lib/registry/session.ts`               | Permissive stub until `auth` replaces it                         |
| `app/(auth)/_layout.tsx`, `sign-in.tsx` | Auth group shell                                                 |
| `app/index.tsx`                         | Entry redirect                                                   |
| `variants/{tabs,drawer,stack}/**`       | Shell layouts, settings screens with `radiance:settings` markers |
| `locales/en.json`                       | Navigation labels                                                |

## Settings composition

Settings screens include:

```tsx
{
  /* radiance:settings:start */
}
{
  /* radiance:settings:end */
}
```

Modules like `settings` (appearance; required by the scaffold), `locale-picker`, and `auth` splice sections between those markers.

## Extending tabs

Overlay or edit `lib/registry/tabs.ts`:

```ts
export const tabs = [
  { name: 'index', titleKey: '…', icon: 'home-outline' },
  { name: 'settings', titleKey: 'navigation.settings', icon: 'settings-outline' },
];
```

## Notes

- Detail routes (e.g. `/product/[id]`) live as siblings under `app/(app)/`, not inside `(tabs)`.
- Pair with `auth` for a real `useSession()` implementation.
