# share module

Native share sheet + clipboard helpers, with optional HTTPS URL builder for deep links.

Install with:

```bash
radiance add share
```

**Requires:** `i18n`  
**Soft dependency:** `deep-linking` (`EXPO_PUBLIC_DEEP_LINK_HOST` for absolute URLs)

## What it does

- `Share.share` wrapper with iOS `url` / Android message formatting.
- Concurrent web shares (`InvalidStateError`) and other failures copy to the clipboard and return `'copied'`. User cancel returns `'dismissed'`.
- Clipboard copy via `expo-clipboard`.
- `buildShareUrl(path)` → `https://{DEEP_LINK_HOST}{path}` or relative path.

## What it adds

| Path              | Purpose                                                          |
| ----------------- | ---------------------------------------------------------------- |
| `lib/share.ts`    | `shareText` (`ShareOutcome`), `copyToClipboard`, `buildShareUrl` |
| `locales/en.json` | `share.copied`                                                   |

## Usage

```ts
import { toast } from '@/components/ui/Toast';
import { shareText, buildShareUrl, copyToClipboard } from '@/lib/share';

const outcome = await shareText('Check this out', buildShareUrl(`/post/${id}`));
if (outcome === 'copied') toast(t('share.copied'));
await copyToClipboard(buildShareUrl(`/event/${id}`));
```

## Notes

- Does not register UI — call from buttons / menus.
- For notification → route flows, use `deep-linking` separately.
