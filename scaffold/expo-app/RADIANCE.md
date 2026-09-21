# Radiance project constitution

This file is the contract between you, the Radiance CLI, and any AI agent working in this
repository. The prompt harness loads it on every run — rules written here are enforced
before generated code is applied.

## Stack (do not swap)

| Concern     | Choice                                                                 |
| ----------- | ---------------------------------------------------------------------- |
| Framework   | Expo SDK 57 (React Native 0.86, React 19.2.3)                          |
| Native run  | Local development build (`expo-dev-client` + Hermes) — **not Expo Go** |
| Routing     | Expo Router (file based, `app/`)                                       |
| Language    | TypeScript, strict mode                                                |
| Backend     | Firebase (JS SDK) — Auth, Firestore, Storage, Functions, Hosting       |
| State       | Zustand stores in `stores/`                                            |
| Local prefs | `react-native-mmkv` (via theme / app modules)                          |
| Forms       | react-hook-form + Zod (via the `forms` module)                         |
| Styling     | React Native `StyleSheet` driven by theme tokens                       |
| i18n        | i18next + `react-i18next`, keys in `locales/`                          |
| Package mgr | yarn (app **and** `functions/`)                                        |

Do not introduce a second state manager, styling system, data-fetching library (no TanStack
Query — use Firestore hooks and `lib/callable.ts`), form library, or i18n library. Extend
what is already installed.

## Directory layout

```text
app/          Expo Router routes. (auth) = signed out, (app) = signed in.
components/   Reusable presentational components.
lib/          Firebase clients, helpers, integrations.
lib/registry/ Radiance-managed composition points (providers, session).
stores/       Zustand stores.
locales/      Translation resources; `en.json` is the source of truth.
functions/    Cloud Functions source (added by the `functions` module).
```

## Non-negotiable patterns

1. **No user-facing string literals in components.** Every visible string goes through
   `t('namespace.key')` and must exist in `locales/en.json`.
2. **No hard-coded colors, font sizes, spacing, or radii in screens or components.** Use
   theme tokens (`useTheme()` / `createStyles`). Raw hex values belong only in
   `lib/theme/`.
3. **Visual quality matches polished starters.** Commit to one tone; one primary action per
   screen; real domain copy; designed StateView empty/loading/error. Prefer `List`/`Grid`
   over FlatList; `Skeleton` for loading that mirrors layout; and shared
   `Avatar`/`IconButton`/`SectionHeader`/`Card`/`SwitchRow`/`Onboarding`/`Dialog`/`Sheet`/`Select`/`Badge`/`MediaImage`/`toast()` over one-off chrome.
   When restyling for a vibe, edit theme tokens first, then at most 1–2 screens. Do not invent
   a second design system or AI-cliché palettes (purple-on-white, cream+terracotta).
4. **Firestore mutations are optimistic.** Write through the helpers in `lib/optimistic.ts`
   so the UI updates immediately and rolls back on failure.
5. **Offline first.** Assume the device may be offline; surface sync state instead of
   blocking the UI, and never spin forever on a network call. For cross-restart native
   Firestore persistence, use the firestore module's `rnfirebase` option.
6. **One Firebase app instance.** Always go through `getFirebaseApp()` in `lib/firebase.ts`.
   Never call `initializeApp` anywhere else.
7. **Cloud Functions are called through `lib/callable.ts`**, never with raw `fetch`.
8. **Security rules are edited through module fragments** between the
   `radiance:rules` markers, not by rewriting the whole file.
9. **Platform branching.** Prefer `@/lib/platform` (`isWeb` / `isNative` / `web()` /
   `native()` / `platform`) over scattered `Platform.OS === …`. For import-level splits
   use `*.web.ts` / `*.native.ts` — the helpers do not tree-shake.
10. **Privilege separation.** Clients may read/write their own documents where rules allow.
    Cross-user mutations go through Cloud Functions + Admin SDK; keep those paths
    `allow write: if false` in rules.

## Radiance-managed regions

Blocks delimited by `radiance:*:start` / `radiance:*:end` markers are maintained by the CLI.
Content outside those markers is yours and will be preserved across module installs and
upgrades.

## Adding capabilities

Prefer `radiance add <module>` over hand-writing a feature that already exists in the
catalog (`radiance templates list`). Only write bespoke code when no module covers the need,
and follow the conventions of the closest existing file.

<!-- radiance:capabilities:start -->
<!-- radiance:capabilities:end -->
