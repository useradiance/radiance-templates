# chat module

1:1 / group messaging: threads, messages subcollection, inbox + thread screens, image attachments via Storage, member-scoped rules, optional push fan-out stub.

Install with:

```bash
radiance add chat
```

**Requires:** `auth`, `firestore`, `i18n`, `theme`, `navigation`, `storage`  
**Side:** `both`

## What it does

- Models conversations as `threads/{threadId}` with `memberIds: string[]`.
- Stores messages under `threads/{id}/messages`.
- Ships inbox (`/chat`) and thread (`/chat/[threadId]`) screens with a people picker for new chats.
- Uploads image attachments to Cloud Storage and stores the **path** on the message (resolved at render with `useStorageUrl`).
- Includes a Firestore trigger that pushes other thread members when a message is created.

## What it adds

| Path                                             | Purpose                                                      |
| ------------------------------------------------ | ------------------------------------------------------------ |
| `lib/chat.ts`                                    | Queries, `createThread`, `sendMessage`, `chatAttachmentPath` |
| `components/ChatInbox.tsx`                       | Inbox list + people picker                                   |
| `components/ChatBubble.tsx`                      | Message bubble with attachment rendering                     |
| `app/(app)/chat/index.tsx`                       | Inbox route                                                  |
| `app/(app)/chat/[threadId].tsx`                  | Thread + composer (attach / send)                            |
| `functions/src/triggers/onChatMessageCreated.ts` | Push fan-out to other members                                |
| `firebase/firestore.rules.fragment`              | Member-only read/write                                       |
| `firebase/firestore.indexes.json`                | `memberIds` + `lastMessageAt`                                |
| `locales/en.json`                                | Chat copy                                                    |

## Data model

```
threads/{threadId}
  memberIds: string[]
  title?: string | null
  lastMessage?: string | null
  lastMessageAt: Timestamp
  unread?: { [uid]: number }

threads/{threadId}/messages/{messageId}
  senderId: string
  text: string
  attachment?: { path: string, contentType?: string | null, name?: string | null } | null
  reactions?: { [emoji: string]: string[] }
  createdAt: Timestamp
```

Storage objects live at `users/{uid}/chat/{threadId}/{timestamp}-{fileName}` (owner write, signed-in read). Images are picked locally and uploaded **only when Send is pressed** (same message as any caption text).

## Usage

```ts
import { createThread, sendMessage, chatAttachmentPath } from '@/lib/chat';
import { uploadFileFromUri } from '@/lib/storage';

const threadId = await createThread([uidA, uidB], 'Design chat');
await sendMessage(threadId, uidA, 'Hello');

const uploaded = await uploadFileFromUri(uri, chatAttachmentPath(uidA, threadId, 'shot.jpg'));
await sendMessage(threadId, uidA, {
  text: 'See this',
  attachment: { path: uploaded.path, contentType: 'image/jpeg', name: 'shot.jpg' },
});
```

Navigate to `/chat` or `/chat/{threadId}` (Expo Router).

## Setup checklist

1. Deploy Firestore rules + indexes.
2. Ensure Storage is enabled (and the Storage emulator on the free plan).
3. Deploy `onChatMessageCreated` so other members get a push.
4. Optionally mount `ChatInbox` on a home tab (see `messaging-app` starter).

## Notes

- Only members listed in `memberIds` can read/write messages.
- Prefer storing attachment `path` (not signed URLs). The thread UI resolves URLs via `useStorageUrl`.
- Members can toggle emoji reactions (`reactions` map); Firestore rules allow updates that only touch that field.
- Document / video picking can be layered with `media-picker` later; the composer ships with image attach via ImagePicker.
