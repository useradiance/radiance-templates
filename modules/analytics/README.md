# analytics module

One tracking API across web and native.

## What it adds

- `lib/analytics.ts` — `trackEvent()`, `trackScreen()`, `identifyUser()`
- `lib/analytics-provider.tsx` — automatic `screen_view` on every route change

## Usage

```ts
trackEvent('post_created', { hasImage: true });
```

Analytics calls never throw and never block a flow — a failed beacon is not worth a broken
screen.

## Platform coverage

| Platform | Backend                            | Status                                                   |
| -------- | ---------------------------------- | -------------------------------------------------------- |
| Web      | `firebase/analytics` (GA4)         | Active when `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` is set |
| Native   | `@react-native-firebase/analytics` | Not installed — events log in dev, drop in production    |

### Enabling native analytics

The Firebase JS SDK cannot report native analytics. When you are ready to leave Expo Go:

```bash
yarn add @react-native-firebase/app @react-native-firebase/analytics
```

Add the config plugin, drop in `google-services.json` / `GoogleService-Info.plist`, create a
development build, then swap the native branch of `trackEvent` to call the RNFirebase API.

## Conventions

- `snake_case` event names, matching GA4.
- Never put personal data in event parameters.
