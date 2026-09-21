# biometrics module

LocalAuthentication app lock / step-up with SecureStore preference.

Install with:

```bash
radiance add biometrics
```

**Requires:** `i18n`, `theme`

## What it does

- Detects hardware + enrolled biometrics.
- Optional app lock gated by SecureStore flag.
- `BiometricGate` provider blocks the tree until unlock succeeds (no-op when lock disabled).

## What it adds

| Path                           | Purpose                                                         |
| ------------------------------ | --------------------------------------------------------------- |
| `lib/biometrics.ts`            | `authenticateLocal`, `setAppLockEnabled`, `isAppLockEnabled`, … |
| `components/BiometricGate.tsx` | Root gate UI                                                    |
| `locales/en.json`              | Lock / unlock copy                                              |

## Usage

```ts
import { setAppLockEnabled, authenticateLocal } from '@/lib/biometrics';

await setAppLockEnabled(true);
const ok = await authenticateLocal('Confirm it is you');
```

Gate is auto-wired as a provider — until `setAppLockEnabled(true)`, children render normally.

## Notes

- This is **local** unlock, not Firebase re-auth. For sensitive callables, also reauthenticate with Firebase.
- Face ID usage string may need an Info.plist blurb via `app.config` plugins in production.
