# in-app-review module

Store review prompt with a 90-day MMKV cooldown.

Install with:

```bash
radiance add in-app-review
```

**Requires:** none

## What it does

- Uses `expo-store-review` when available.
- Remembers last prompt time; skips if within cooldown.

## What it adds

| Path                   | Purpose                                     |
| ---------------------- | ------------------------------------------- |
| `lib/in-app-review.ts` | `maybeRequestReview()` → `Promise<boolean>` |

## Usage

Call after a positive moment (successful checkout, habit streak, 5-star flow):

```ts
import { maybeRequestReview } from '@/lib/in-app-review';

await maybeRequestReview();
```

Returns `true` if a prompt was shown.

## Notes

- OS may ignore the request (quota). Never gate UX on the return value beyond analytics.
- Requires a store build / TestFlight / Play internal testing for real prompts.
