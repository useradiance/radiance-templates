# content starter

Article / CMS with drafts, publishing, comments, search, MMKV bookmarks, SEO head tags, and Hosting.

```bash
radiance init my-magazine --template content
```

**Extends:** `expo-app`  
**Default theme pack:** `paper`

## Who it is for

Publishers, blogs, knowledge bases (read-heavy).

## Modules installed

| Module                                     | Role                        |
| ------------------------------------------ | --------------------------- |
| `i18n`, `theme`, `navigation`, `firestore` | Shell                       |
| `auth`, `forms`, `comments`, `functions`   | Sign-in, editor, discussion |
| `storage`                                  | Cover images                |
| `search`                                   | Title prefix search         |
| `seo`, `hosting`                           | Web discovery + deploy      |
| `analytics`                                | Reads                       |

Auth is required to write and publish. Readers can browse published pieces without an account if you later open the shell; the starter includes `auth` so the Write tab works.

## Overlay

| Path                                        | Purpose                         |
| ------------------------------------------- | ------------------------------- |
| `overlay/app/(app)/(tabs)/index.tsx`        | Article list + search + SEO     |
| `overlay/app/(app)/(tabs)/write.tsx`        | CMS editor — draft / publish    |
| `overlay/app/(app)/(tabs)/bookmarks.tsx`    | Local bookmarks                 |
| `overlay/app/(app)/article/[articleId].tsx` | Reader + bookmark toggle + SEO  |
| `overlay/lib/articles.ts`                   | Articles query                  |
| `overlay/stores/bookmarks.ts`               | MMKV bookmark ids               |
| `overlay/lib/registry/tabs.ts`              | Articles / bookmarks / settings |
| `overlay/locales/en.json`                   | Copy                            |
| `firebase/firestore.rules.fragment`         | Public article read             |

## Data model

| Path            | Shape                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| `articles/{id}` | `title`, `excerpt`, `body`, `coverUrl?`, `nameLower`, `status` (`draft` \| `published`), `authorId`, `publishedAt` |

## Key behaviours

- Home feed lists `status == published`.
- Write tab saves drafts or publishes; comments appear on published pieces.

## Next steps

```bash
radiance add onboarding-flow
```
