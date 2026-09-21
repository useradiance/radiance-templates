# callable-client module

Typed client for Firebase HTTPS callables — the app's only door to Cloud Functions.

Install with:

```bash
radiance add callable-client
```

**Requires:** `i18n`

## What it does

- Wraps `httpsCallable` with TypeScript contracts, retries (reads), logging, and translated errors.
- Supports selective emulator flags.
- Logs out / surfaces unauthenticated failures consistently.

## What it adds

| Path                        | Purpose                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| `lib/callable.ts`           | `call()`, `CallableError`, `callableErrorKey()`, emulator wiring |
| `lib/callable-contracts.ts` | Typed request/response map (`radiance:contracts` markers)        |

## Usage

```ts
import { call, callableErrorKey } from '@/lib/callable';

try {
  const result = await call('ping', {});
} catch (error) {
  setErrorKey(callableErrorKey(error));
}
```

## Adding a function

1. Implement and export it in `functions/src/index.ts` (between `radiance:functions` markers when using module installs).
2. Add types to `CallableContracts` between `radiance:contracts` markers (modules often splice this automatically).
3. Map any new error code in `ERROR_KEYS` and add the i18n string.

## Rules

- No raw `fetch` to Functions URLs — it bypasses auth tokens, App Check, and error mapping.
- `retries` is for **reads** only. Retrying a write without an idempotency key duplicates side effects.
- Prefer `functions` module error helpers (`requireAuth`, `invalidArgument`, …) so codes stay aligned.
