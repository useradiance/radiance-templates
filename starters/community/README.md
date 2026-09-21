# community starter

Forum-style channels and threads with comments, report button, roles, and push.

```bash
radiance init my-community --template community
```

**Extends:** `expo-app`  
**Default theme pack:** `contrast`

## Who it is for

Communities / support forums (channel → thread → comments), not a social photo feed.

## Modules installed

| Module                                                 | Role                           |
| ------------------------------------------------------ | ------------------------------ |
| Core + `auth`, `firestore`, `forms`                    | App                            |
| `comments`                                             | Thread discussion UI           |
| `search`                                               | Channel autocomplete           |
| `moderation`                                           | `ReportButton` + admin resolve |
| `roles`                                                | Admin / moderator claims       |
| `push-notifications`                                   | Reply alerts                   |
| `functions`, `callable-client`, `hosting`, `analytics` | Backend + web                  |

## Overlay

| Path                                                  | Purpose                  |
| ----------------------------------------------------- | ------------------------ |
| `overlay/app/(app)/(tabs)/index.tsx`                  | Channel list             |
| `overlay/app/(app)/channel/[channelId].tsx`           | Threads + create         |
| `overlay/app/(app)/thread/[channelId]/[threadId].tsx` | Report + comments        |
| `overlay/lib/community.ts`                            | Channel / thread helpers |
| `overlay/lib/registry/tabs.ts`                        | Tabs                     |
| `overlay/locales/en.json`                             | Copy                     |
| `firebase/firestore.rules.fragment`                   | Channel/thread rules     |

## Data model

| Path                         | Shape                                         |
| ---------------------------- | --------------------------------------------- |
| `channels/{id}`              | `name`, `description?`                        |
| `channels/{id}/threads/{id}` | `title`, `authorId`, `channelId`, `createdAt` |
| `comments/{id}`              | `parentPath = "channels/{c}/threads/{t}"`     |
| `reports/{id}`               | Via `moderation` module                       |

## Key behaviours

- Search uses the `search` module autocomplete (local + Firestore prefix on `nameLower`).
- New comments notify the thread author (`onCommentCreated`).

## Next steps

```bash
radiance add presence
```
