# Radiance app

Generated with [Radiance](https://github.com/useradiance/radiance-cli) from the `expo-app`
scaffold: Expo SDK 57 + Expo Router + Firebase + Zustand.

## Getting started

```bash
yarn install
cp .env.example .env      # fill in your Firebase web config
yarn android              # first time: local native build (Hermes), not Expo Go
# or: yarn ios
yarn start                # Metro in --dev-client mode (reattach to that binary)
```

Press `w` for web. For native, prefer `yarn android` / `yarn ios` (or `a` / `i` after a
development build is installed). Radiance does **not** use Expo Go.

## Scripts

| Script            | Purpose                                                      |
| ----------------- | ------------------------------------------------------------ |
| `yarn start`      | Metro `--dev-client` (+ emulators when `.env` enables them)  |
| `yarn android`    | Local Android development build (`expo run:android`, Hermes) |
| `yarn ios`        | Local iOS development build (`expo run:ios`, Hermes)         |
| `yarn web`        | Expo web                                                     |
| `yarn start:app`  | Metro only (`--dev-client`, no emulators)                    |
| `yarn test`       | Jest unit tests                                              |
| `yarn typecheck`  | `tsc --noEmit`                                               |
| `yarn lint`       | ESLint (expo config)                                         |
| `yarn format`     | Prettier write                                               |
| `yarn emulators`  | Firebase Emulator Suite (standalone)                         |
| `yarn export:web` | Static web build for Firebase Hosting                        |

## Build variants

`APP_VARIANT` (`development` | `preview` | `production`) changes the display name and
bundle id (`.dev` / `.preview` suffixes) so multiple installs can sit side by side. See
`eas.json` and `app.config.ts`. Map Firebase projects via `.firebaserc` aliases
`staging` and `prod`.

## Firebase

Configuration comes from `EXPO_PUBLIC_FIREBASE_*` variables in `.env`. To develop against
the Emulator Suite, set `EXPO_PUBLIC_USE_FIREBASE_EMULATORS=true` — `yarn start` will boot
the enabled product emulators automatically (free-plan setup turns on Storage + Functions).
Use `yarn emulators` in a second terminal if you prefer to keep them running separately, or
`yarn start:app` for Expo only. Use `EXPO_PUBLIC_FIREBASE_EMULATOR_HOST` with your LAN IP on
physical devices, and optional per-product flags (`EXPO_PUBLIC_EMULATOR_AUTH`, `_FIRESTORE`,
`_FUNCTIONS`, `_STORAGE`).

Security rules live in `firestore.rules` and `storage.rules`. Module-owned rules are written
between the `radiance:rules` markers — edit around them, not through them. Cross-user
writes belong in Cloud Functions (Admin SDK).

## Adding features

```bash
radiance add auth
radiance add storage
radiance templates list
```

Project conventions that both you and the AI harness must follow are documented in
[`RADIANCE.md`](./RADIANCE.md).
