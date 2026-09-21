# auth module

Firebase Authentication end to end: screens, session, profile documents, security rules, and selectable providers (email, Google, Apple, phone, anonymous).

Install with:

```bash
radiance add auth --option providers=email
radiance add auth --option providers=email,google
radiance add auth --option providers=google,apple
radiance add auth --option providers=email,phone,anonymous
# change later:
radiance add auth --force --option providers=email,google
```

The choice is stored on the feature in `radiance.json`. Only the selected providers get their npm dependencies, env vars, Firebase auth provider entries, and variant files.

## What it does

- Email/password sign-up, sign-in, forgot-password screens.
- Optional Google / Apple social buttons.
- Optional phone (SMS) and anonymous providers.
- Session store + real `useSession()` for navigation gates.
- Idempotent `users/{uid}` profile bootstrap (client + optional Functions triggers).
- Account settings section (sign-out / delete-account) spliced into Settings.
- Optional enforced email verification via install option.

## What it adds

| Path                                                           | Purpose                                             |
| -------------------------------------------------------------- | --------------------------------------------------- |
| `lib/auth.ts`                                                  | `getFirebaseAuth()` with React Native persistence   |
| `lib/auth-config.ts`                                           | Which providers this install enabled                |
| `lib/auth-provider.tsx`                                        | Session subscription + profile provisioning         |
| `lib/registry/session.ts`                                      | Real `useSession()` used by route guards            |
| `lib/auth-providers/*`                                         | Google / Apple / phone implementations (variants)   |
| `lib/social-auth.ts`                                           | Re-exports the provider helpers                     |
| `lib/user-profile.ts`                                          | `users/{uid}` document helpers                      |
| `lib/auth-errors.ts`                                           | Firebase error codes → translation keys             |
| `stores/auth.ts`                                               | Zustand auth store and actions                      |
| `app/(auth)/sign-in.tsx`, `sign-up.tsx`, `forgot-password.tsx` | Screens                                             |
| `components/auth/*`                                            | Social buttons, verification banner, settings block |
| `functions/src/triggers/user.ts`                               | Identity triggers (needs `functions`)               |
| `functions/src/callable/deleteAccount.ts`                      | Account deletion callable                           |
| `firebase/firestore.rules.fragment`                            | Profile rules                                       |

## Phone provider

`--option providers=…,phone` copies `variants/phone`:

- **Web:** Firebase `signInWithPhoneNumber` + invisible reCAPTCHA (`#recaptcha-container` must exist on the page).
- **Native:** needs a development build and RNFirebase / SafetyNet / Play Integrity wiring — see variant source comments.

Enable **Phone** in the Firebase console before testing.

## Identity model

- **Email is the primary credential identity** for email/social flows (no username aliasing).
- Providers: **email/password**, **Google**, **Apple**, **phone** (SMS), **anonymous**.
- `users/{uid}` holds `{ uid, email, displayName, photoURL, providerIds, createdAt, updatedAt }`.
- Email verification is prompted by default, not enforced — use `--option enforceEmailVerification=true` to tighten callables / session.

## Setup checklist

1. Firebase console → Authentication → enable only the providers you selected.
2. Google: `radiance setup firebase` writes `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` from Identity Toolkit. Native iOS/Android client ids are optional (Expo AuthSession can use the web id).
3. Apple: paid Apple Developer account + Services ID in Firebase (required for App Store if other social providers ship on iOS).
4. Phone: reCAPTCHA / app verification configured for each platform.
5. Deploy rules: `firebase deploy --only firestore:rules`.
6. Deploy Functions if using delete-account / user triggers.

## Notes

- Re-run with `--force` and a new `--option providers=…` to change the mix after the fact.
- Sign-up and forgot-password redirect to sign-in when email auth is disabled.
- Google uses Firebase popup on web and Expo AuthSession on native.
- Apple passes a hashed nonce to Firebase to prevent credential replay.
- Delete-account requires `functions` + `callable-client`.
