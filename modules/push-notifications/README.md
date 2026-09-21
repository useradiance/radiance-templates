# push-notifications module

Expo push notifications with device registration in Firestore, permission flow, tap handling, and a send callable.

Install with:

```bash
radiance add push-notifications
```

**Requires:** `auth`, `firestore`, `i18n`  
**Side:** `both`

## What it does

- Requests notification permissions and obtains an Expo push token.
- Stores per-device docs under the signed-in user.
- `PushProvider` registers on sign-in and handles foreground presentation + taps.
- Callable `sendPushToUser` sends via Expo Push API (and FCM helper for native tokens where applicable).
- Tap payloads can include a deep-link path for `deep-linking`.

## What it adds

| Path                                      | Purpose                                      |
| ----------------------------------------- | -------------------------------------------- |
| `lib/push.ts` (or similar under `files/`) | Permissions, token retrieval, device records |
| `lib/push-provider.tsx`                   | Provider (auto-wired)                        |
| `functions/src/callable/sendPush.ts`      | Server send helper                           |
| `firebase/firestore.rules.fragment`       | Device doc rules                             |
| Config plugin                             | `expo-notifications` in `app.config`         |

## Platform support

| Platform | Expo Go        | Extra setup                                        |
| -------- | -------------- | -------------------------------------------------- |
| iOS      | No remote push | APNs key in Firebase, development/production build |
| Android  | No remote push | Development build                                  |
| Web      | Not supported  | —                                                  |

```bash
npx expo run:ios
# or: eas build --profile development
```

## Usage

Provider registers automatically. To notify:

```ts
await call('sendPushToUser', {
  // follow the installed callable contract
});
```

Notification `data` may include `{ deeplink: '/chat/abc' }` or `{ url: '/posts/123' }` for routing on tap.

## Before production

- Restrict `sendPushToUser` so users cannot spam arbitrary recipients (self-only, relationship checks, or admin).
- Upload APNs key / FCM credentials.
- Test on physical devices with a dev client.
