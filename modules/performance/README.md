# performance module

Firebase Performance Monitoring traces (web JS SDK + RNFirebase on native).

Install with:

```bash
radiance add performance
```

**Requires:** none

## What it does

- `withTrace(name, fn)` wraps async work in a custom trace.
- Platform-resolved: `performance.ts` (web) / `performance.native.ts` (native).

## What it adds

| Path                        | Purpose                        |
| --------------------------- | ------------------------------ |
| `lib/performance.ts`        | Web `getPerformance` + `trace` |
| `lib/performance.native.ts` | `@react-native-firebase/perf`  |

## Usage

```ts
import { withTrace } from '@/lib/performance';

const result = await withTrace('load_feed', async () => {
  return fetchFeed();
});
```

## Setup checklist

1. Enable Performance Monitoring in Firebase console.
2. Native: development/production build with RNFirebase + google-services files.
3. Web: ensure measurement / performance is enabled for the web app.

## Notes

- Automatic HTTP/screen traces depend on SDK defaults; custom traces use `withTrace`.
