# seo module

Expo Router `Head` helpers for titles, descriptions, and Open Graph tags on web exports.

Install with:

```bash
radiance add seo
```

**Requires:** `hosting`

## What it does

- Renders `<title>`, meta description, `og:*`, and Twitter card tags.
- Builds absolute `og:url` when `EXPO_PUBLIC_DEEP_LINK_HOST` is set.

## What it adds

| Path                     | Purpose              |
| ------------------------ | -------------------- |
| `components/SeoHead.tsx` | Per-screen head tags |

## Usage

```tsx
import { SeoHead } from '@/components/SeoHead';

<SeoHead
  title="Summer collection"
  description="New arrivals"
  imageUrl="https://…"
  path="/product/abc"
/>;
```

## Notes

- Native apps ignore Head — safe to leave in shared screens.
- For SPA hosting, ensure Firebase Hosting rewrites serve `index.html` (hosting module).
