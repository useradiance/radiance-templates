# hosting module

Firebase Hosting for the Expo **web** export: SPA rewrites, asset caching, and deploy scripts.

Install with:

```bash
radiance add hosting
```

**Requires:** none  
**Side:** `app` (manifest / Firebase config — typically no copied UI files)

## What it does

- Configures Hosting to serve the Expo web export (`dist/`).
- Rewrites all unmatched paths to `index.html` so Expo Router deep links work on refresh.
- Long-cache hashed `/_expo/static/**` assets; never cache `index.html`.
- Adds deploy scripts (e.g. `yarn deploy:web`).

## Deploying

```bash
yarn deploy:web
# expo export --platform web && firebase deploy --only hosting
```

## Preview channels

```bash
firebase hosting:channel:deploy pr-42 --expires 7d
```

Share a temporary URL before production.

## Pairing modules

| Module         | Why                                           |
| -------------- | --------------------------------------------- |
| `seo`          | Per-route `<Head>` / Open Graph tags on web   |
| `deep-linking` | Same host used for universal links + `og:url` |

## Notes

- Env vars are inlined at **export** time — re-export after changing `.env`.
- Firebase Hosting is the configured web host; EAS Hosting is out of scope for this module.
- Native iOS/Android builds use EAS / store pipelines, not this module.
