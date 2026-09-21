# comments module

Polymorphic comments attached to any parent path (posts, products, threads, …).

Install with:

```bash
radiance add comments
```

**Requires:** `auth`, `firestore`, `forms`, `i18n`, `theme`

## What it does

- Stores comments in a top-level `comments` collection keyed by `parentPath`.
- Query is equality-only; `CommentsSection` sorts by `createdAt` in memory so a fresh project works while the composite index builds.
- Ships `CommentsSection` UI: list with relative timestamps + compose for signed-in users.
- On create, `addComment` also increments `commentCount` on a two-segment parent (`posts/{id}`).
- Optional `parentOwnerId` lets the parent owner cascade-delete comments.
- `onCommentCreated` notifies the parent author (posts, articles, threads, tasks).

## What it adds

| Path                                         | Purpose                                                                                                              |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `lib/comments.ts`                            | `commentsQueryForParent`, `sortComments`, `commentCreatedAt`, `countCommentsForParent`, `addComment`, `Comment` type |
| `components/CommentsSection.tsx`             | Drop-in section for detail screens                                                                                   |
| `functions/src/triggers/onCommentCreated.ts` | Push to the parent author                                                                                            |
| `firebase/firestore.rules.fragment`          | Comment security rules                                                                                               |
| `firebase/firestore.indexes.json`            | `parentPath` + `createdAt`                                                                                           |
| `locales/en.json`                            | Comment copy                                                                                                         |

## Data model

```
comments/{commentId}
  parentPath: string   // e.g. "posts/abc" or "channels/x/threads/y"
  authorId: string
  authorName?: string | null
  text: string
  createdAt: Timestamp
  parentOwnerId?: string | null
```

## Usage

```tsx
<CommentsSection parentPath={`posts/${postId}`} parentOwnerId={post.authorId} />
```

## Setup checklist

1. Deploy rules. The client query is equality-only (`parentPath`) and sorts in memory, so comments work while the composite index is still building.
2. Place `CommentsSection` on detail screens (see `social-app`, `community` starters).
