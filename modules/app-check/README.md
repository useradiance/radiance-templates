# app-check module

Blocks traffic that does not come from your app.

## What it adds

- `lib/app-check.tsx` — reCAPTCHA v3 attestation on web, debug token support, no-op on native

## Setup

1. Firebase console → **App Check** → register the web app with **reCAPTCHA v3**.
2. Put the site key in `.env` as `EXPO_PUBLIC_RECAPTCHA_SITE_KEY`.
3. For local development, copy the debug token the console generates into
   `EXPO_PUBLIC_APP_CHECK_DEBUG_TOKEN` and register it under App Check → Manage debug tokens.

## Enforcement

Turn enforcement on **after** the console shows a healthy share of verified requests —
enabling it too early locks out real users. Start with Cloud Functions callables, then
Firestore and Storage.

## Platform coverage

| Platform | Provider       | Status in this module                                |
| -------- | -------------- | ---------------------------------------------------- |
| Web      | reCAPTCHA v3   | Enabled                                              |
| iOS      | App Attest     | Needs `@react-native-firebase/app-check` + dev build |
| Android  | Play Integrity | Needs `@react-native-firebase/app-check` + dev build |

Until native attestation is added, keep enforcement off for services your mobile app calls.
