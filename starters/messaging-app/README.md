# messaging-app starter

Direct-message inbox built on the `chat` module, with push and deep-linking installed for conversation re-entry.

```bash
radiance init my-chat --template messaging-app
```

**Extends:** `expo-app`  
**Default theme pack:** `ocean`

## Who it is for

Messaging-first apps: inbox, threads, optional attachments via `storage`.

## Modules installed

| Module                                                            | Role                                                        |
| ----------------------------------------------------------------- | ----------------------------------------------------------- |
| Core: `i18n`, `theme`, `navigation`, `firestore`, `forms`, `auth` | Foundation                                                  |
| `chat`                                                            | Threads, messages, attachments, inbox/thread screens, rules |
| `storage`                                                         | Image uploads for chat attachments                          |
| `push-notifications`, `deep-linking`                              | Notify + open thread                                        |
| `callable-client`, `functions`, `analytics`, `hosting`            | Backend + web                                               |

## Overlay

| Path                                 | Purpose                                                    |
| ------------------------------------ | ---------------------------------------------------------- |
| `overlay/app/(app)/(tabs)/index.tsx` | Home tab = `ChatInbox` (no stacked `/chat`)                |
| `overlay/app/(app)/chat/index.tsx`   | `/chat` → Messages tab                                     |
| `overlay/lib/registry/tabs.ts`       | Messages + settings tabs                                   |
| `overlay/locales/en.json`            | Starter strings                                            |
| `firebase/*`                         | Placeholder domain rules (chat rules come from the module) |

## Screens from the chat module

| Route              | Purpose                   |
| ------------------ | ------------------------- |
| `/chat`            | Inbox (`memberIds` query) |
| `/chat/[threadId]` | Messages + composer       |

## Data model

See the `chat` module README (`threads` / `messages`).

## Key behaviours

- Create threads with `createThread([uidA, uidB], title?)`.
- Extend `onChatMessageCreated` is already wired — other members get a push when device tokens exist.
- Deep link threads as `/chat/{threadId}`.

## Next steps

```bash
radiance add presence
radiance add media-picker   # documents / camera beyond image attach
```
