# radiance-templates

The catalogue behind [Radiance](https://github.com/useradiance/radiance-cli): one Expo scaffold,
a set of composable feature modules, and starters that combine them into working apps.

```text
scaffold/expo-app     the generic Expo + Firebase shell (exactly one)
modules/<id>          composable vertical slices: app code + Firebase + wiring
starters/<id>         thin compositions: scaffold + module list + domain overlay
registry.json         generated index of everything above
```

Nothing here is a full duplicate app. An Expo upgrade lands once, in the scaffold; a change
to authentication lands once, in `modules/auth`.

## Layers

### 1. Scaffold

`scaffold/expo-app` is a runnable Expo SDK 57 app with TypeScript, ESLint, Prettier, Metro,
`firebase.json`, empty security rules and a placeholder screen. It owns tooling and nothing
else — no auth screens, no domain UI.

Every project also gets the modules listed in `scaffold.json → requiredModules`
(`i18n`, `theme`, `navigation`), so the project conventions hold from the first commit.

### 2. Modules

A module is a full vertical slice of one capability:

```text
modules/auth/
├── module.json                       manifest: version, capabilities, deps, wiring
├── files/                            copied into the project root, paths preserved
├── locales/en.json                   deep-merged into the project's translations
├── functions/                        merged into functions/ when that module is installed
├── firebase/
│   ├── firestore.rules.fragment      spliced between the radiance:rules markers
│   ├── storage.rules.fragment
│   └── firestore.indexes.json        merged into the project's indexes
└── README.md
```

Manifest fields:

| Field            | Meaning                                                                                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `capabilities`   | Search terms the prompt harness matches against — be generous                                                                                                   |
| `requires`       | Modules installed first, in dependency order                                                                                                                    |
| `dependencies`   | npm packages always merged into the app's `package.json`                                                                                                        |
| `options`        | Install-time choices (`single` or `multi`) exposed as `--option key=value`                                                                                      |
| `optionBindings` | Per-choice extras: deps, env, secrets, params, auth providers, and optional file variants                                                                       |
| `env`            | Client-facing vars → root `.env` / `.env.example` (often `EXPO_PUBLIC_*`). Use `{ description, required?, prompt? }` (string form = docs only).                 |
| `secrets`        | Server credentials → Secret Manager (`defineSecret`). Emulator: `functions/.secret.local`. Production: `firebase functions:secrets:set`. Never `EXPO_PUBLIC_*`. |
| `params`         | Non-secret server config → `defineString`. Local: `functions/.env`. Documented in `functions/.env.example`. Never `EXPO_PUBLIC_*`.                              |
| `wire.providers` | React providers registered in `lib/registry/providers.tsx`                                                                                                      |
| `wire.markers`   | Blocks spliced into marked regions of existing files                                                                                                            |
| `firebase`       | Services, emulators, rule/index fragments, function names                                                                                                       |
| `overrides`      | Paths this module may replace even when they already differ                                                                                                     |
| `removes`        | Paths deleted before the module's files are copied                                                                                                              |

Example — selectable auth providers:

```bash
radiance add auth --option providers=email
radiance add auth --option providers=email,google,phone
radiance init my-app -t social-app --option providers=google,apple
```

Example — required env (prompted during interactive `init` / `add`):

```json
"env": {
  "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY": {
    "description": "Google Maps API key for web + native map tiles",
    "required": true
  }
}
```

`required: true` implies `prompt: true`. Set `"prompt": false` when the value is filled later (for example `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is written by `radiance setup firebase`). The key still lands in `.env.example`, and `radiance doctor` still checks required keys. Plain string values are still accepted for `.env.example` documentation only.

Example — server secret + param (email module):

```json
"secrets": {
  "RESEND_API_KEY": {
    "description": "Resend API key (never EXPO_PUBLIC_)",
    "required": true
  }
},
"params": {
  "EMAIL_FROM": {
    "description": "Verified from address",
    "required": true
  }
}
```

### 3. Starters

A starter declares which modules to install and supplies only the domain-specific files:

```json
{
  "id": "social-app",
  "extends": "expo-app",
  "modules": ["i18n", "theme", "navigation", "firestore", "auth", "storage"],
  "overlay": "overlay"
}
```

If a pattern shows up in two starters, promote it to a module.

## Available modules

| Module               | Capability                                                   |
| -------------------- | ------------------------------------------------------------ |
| `i18n`               | i18next, device locale, formatting helpers                   |
| `theme`              | Design tokens, light/dark, UI primitives including DataTable |
| `navigation`         | Route groups, guards, tab registry                           |
| `forms`              | react-hook-form + Zod                                        |
| `firestore`          | Offline-first data layer, optimistic writes, sync state      |
| `auth`               | Email / Google / Apple / phone / anonymous (selectable)      |
| `storage`            | Uploads with progress, image picking                         |
| `functions`          | Cloud Functions 2nd gen project                              |
| `callable-client`    | Typed callable wrappers with translated errors               |
| `hosting`            | Firebase Hosting for the Expo web export                     |
| `push-notifications` | Expo push, device tokens, sender function                    |
| `app-check`          | reCAPTCHA / App Attest attestation                           |
| `analytics`          | Event and screen tracking                                    |
| `crashlytics`        | Native crash reporting (development build required)          |
| `maps`               | Cross-platform map view + location                           |
| `deep-linking`       | Scheme / universal links → Expo Router                       |
| `locale-picker`      | Language preference in Settings                              |
| `stripe`             | Stripe Checkout Session + webhook                            |
| `settings`           | Appearance settings shell                                    |
| `roles`              | Custom claims, RequireRole, admin callables                  |
| `search`             | Firestore prefix / keyword search + SearchField              |
| `subscriptions`      | Stripe Billing portal + entitlement mirror                   |
| `chat`               | Threads, messages, inbox screens                             |
| `remote-config`      | Firebase Remote Config + typed defaults                      |
| `force-update`       | Minimum version gate                                         |
| `cart`               | MMKV shopping cart                                           |
| `comments`           | Polymorphic comments section                                 |
| `share`              | Share sheet + clipboard helpers                              |
| `media-picker`       | Image / camera / document pick                               |
| `connectivity`       | Online/offline banner                                        |
| `onboarding-flow`    | First-run multi-step onboarding                              |
| `invites`            | Invite codes + accept deep link                              |
| `email`              | Transactional email callable (Resend)                        |
| `moderation`         | Report content + admin resolve                               |
| `presence`           | Online / last-seen heartbeat                                 |
| `performance`        | Firebase Performance traces                                  |
| `consent`            | ATT / analytics consent banner                               |
| `in-app-review`      | Store review prompt with cooldown                            |
| `seo`                | Expo web Head / Open Graph helpers                           |
| `calendar`           | Month grid + calendarEvents helpers                          |
| `places`             | Places search + geofence helpers                             |
| `barcode`            | Camera barcode / QR scanner                                  |
| `biometrics`         | LocalAuthentication app lock                                 |

## Starters

| Starter          | What you get                                               |
| ---------------- | ---------------------------------------------------------- |
| `social-app`     | Feed, posts, likes, comments, share, push / deep links     |
| `e-commerce`     | Catalogue, search, cart module, Stripe Checkout            |
| `productivity`   | Projects/tasks, collaborators, push                        |
| `messaging-app`  | DM inbox via chat module                                   |
| `marketplace`    | Two-sided listings, search, maps, Stripe                   |
| `booking`        | Services, calendar booking, Stripe deposits                |
| `saas`           | Workspaces, roles, subscriptions, remote-config            |
| `local-business` | Store locator, places, contact, SEO                        |
| `events`         | Events, RSVP, share, tickets                               |
| `content`        | Articles, search, bookmarks, SEO                           |
| `community`      | Channels, threads, comments, moderation                    |
| `habits`         | Daily habits with streaks                                  |
| `warehouse`      | Inventory grid: categories, items, warehouses, stock, RBAC |

## Working on the catalogue

```bash
yarn registry:build     # regenerate registry.json after editing a manifest
yarn registry:check     # CI guard: registry freshness, graph, stack titles, Expo SDK pins
yarn test               # pin-checker unit tests (including the expo-camera 17 vs 57 fixture)
yarn format
```

`registry.json` is generated. The build fails if a module requires something that does not
exist or a starter lists an unknown module.

## Versioning

The repository is semver tagged, and the CLI caches releases immutably under
`~/.cache/radiance/templates/releases/<version>`. Projects pin the registry and module
versions they were built with in `radiance.json`, so `radiance update` and
`radiance upgrade` are explicit, reviewable operations.
