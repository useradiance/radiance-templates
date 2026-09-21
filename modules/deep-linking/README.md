# deep-linking module

Scheme and universal-link helpers that map incoming URLs and notification payloads to Expo Router navigations.

Install with:

```bash
radiance add deep-linking
```

**Requires:** `navigation`

## What it does

- Registers `DeepLinkProvider` to handle initial URL + runtime URL events.
- Normalizes paths and navigates via Expo Router.
- Consumes `deeplink` / `url` keys from notification response data (pairs with `push-notifications`).

## What it adds

| Path                                    | Purpose                              |
| --------------------------------------- | ------------------------------------ |
| `lib/deep-linking.tsx`                  | Provider wired into the app registry |
| `lib/deep-link-utils.ts`                | URL parsing / path helpers           |
| `lib/__tests__/deep-link-utils.test.ts` | Unit tests for parsers               |

## Configuration

| Env                          | Purpose                                                       |
| ---------------------------- | ------------------------------------------------------------- |
| `EXPO_PUBLIC_DEEP_LINK_HOST` | HTTPS host for universal / app links (e.g. `app.example.com`) |

Also configure `scheme` in `app.config`, plus:

- iOS Associated Domains
- Android App Links intent filters

## Usage with share

```ts
import { buildShareUrl } from '@/lib/share'; // share module
buildShareUrl('/post/abc'); // https://{host}/post/abc
```

## Notes

- Host an `apple-app-site-association` / `assetlinks.json` on the deep-link domain.
- Test with `npx uri-scheme open <scheme>://path --ios` during development.
