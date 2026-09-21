# crashlytics module

Crash and non-fatal error reporting for iOS and Android.

## What it adds

- `lib/crashlytics.ts` — `recordError()`, `logBreadcrumb()`, `identifyForCrashReports()`
- `lib/crashlytics.web.ts` — console-only implementation picked automatically on web
- `components/ErrorBoundary.tsx` — catches render crashes and reports them
- `@react-native-firebase/app` (`disableSPM`) and `expo-build-properties` (`useFrameworks: 'static'`) config plugins

## Requirements

Crashlytics is a native SDK, so **Expo Go cannot run it**. You need a development build:

```bash
npx expo prebuild
npx expo run:ios      # or run:android, or eas build
```

Before building, add the platform config files from the Firebase console:

- `google-services.json` (Android) → project root, referenced from `app.config.ts`
- `GoogleService-Info.plist` (iOS) → project root, referenced from `app.config.ts`

## Verifying the integration

```ts
recordError(new Error('Radiance crashlytics smoke test'));
```

Reports upload on the **next app launch**, not immediately — force-quit and reopen the app,
then check the Firebase console.

## Usage

```tsx
<ErrorBoundary>
  <Stack />
</ErrorBoundary>
```

Wrap route groups rather than the entire app so one broken screen does not take the whole
session down.
