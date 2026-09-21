# social-app starter

Social feed with accounts, image posts, likes, comments, follows / friends, share actions, and push / deep-link ready wiring.

```bash
radiance init my-app --template social-app --demo
# or
radiance init my-app -t social-app --option providers=google,apple
```

**Extends:** `expo-app`  
**Default theme pack:** `branded`

`--demo` seeds **five people**, posts, comments, likes, and a follow graph (including mutual friends with the signed-in user).

## Who it is for

Consumer social products: timelines, profiles, photo posts, light engagement (likes / comments / share), and a people graph.

## Modules installed

| Module                         | Role in this starter                      |
| ------------------------------ | ----------------------------------------- |
| `i18n`, `theme`, `navigation`  | Scaffold-required UX foundation           |
| `firestore`, `forms`           | Feed data + compose validation            |
| `auth`                         | Accounts, profiles, session gates         |
| `storage`                      | Post image uploads                        |
| `callable-client`, `functions` | Backend callables ready                   |
| `analytics`, `hosting`         | Metrics + web export                      |
| `push-notifications`           | Re-engagement hooks                       |
| `deep-linking`                 | Shareable post URLs / notification routes |
| `comments`                     | Polymorphic comments on posts             |
| `search`                       | Debounced people + post autocomplete      |
| `share`                        | Native share sheet from feed / detail     |
| `demo-data`                    | Optional first-run seed (`--demo`)        |

## Overlay (domain files)

| Path                                    | Purpose                                                |
| --------------------------------------- | ------------------------------------------------------ |
| `overlay/app/(app)/(tabs)/index.tsx`    | Home feed + search                                     |
| `overlay/app/(app)/(tabs)/new-post.tsx` | Composer                                               |
| `overlay/app/(app)/(tabs)/people.tsx`   | Friends, follows, and suggested people                 |
| `overlay/app/(app)/(tabs)/profile.tsx`  | Own profile, counts, posts                             |
| `overlay/app/(app)/user/[userId].tsx`   | Another person's profile                               |
| `overlay/app/(app)/post/[postId].tsx`   | Post detail: share + `CommentsSection`                 |
| `overlay/components/PostCard.tsx`       | Card with like / comment / share; author opens profile |
| `overlay/components/PersonHeader.tsx`   | Avatar, bio, follower / following / friends counts     |
| `overlay/components/FollowButton.tsx`   | Follow, following, or friends                          |
| `overlay/lib/posts.ts`                  | Feed queries, create/delete, likes                     |
| `overlay/lib/follows.ts`                | Follow graph queries and writes                        |
| `overlay/lib/people.ts`                 | User directory                                         |
| `overlay/lib/demo-content.ts`           | Five people + posts / comments / likes / follows       |
| `overlay/lib/registry/tabs.ts`          | Tab definitions                                        |
| `overlay/locales/en.json`               | Feed / profile / people strings                        |
| `firebase/firestore.rules.fragment`     | Post, like, and follow rules                           |
| `firebase/firestore.indexes.json`       | Feed / author indexes                                  |

## Data model

| Path                                | Shape                                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `users/{uid}`                       | Profile (`displayName`, `photoURL`, optional `bio`)                                                      |
| `posts/{postId}`                    | `authorId`, `authorName`, `authorPhotoURL`, `text`, `imageUrl`, `likeCount`, `commentCount`, `createdAt` |
| `posts/{postId}/likes/{userId}`     | One like per user                                                                                        |
| `comments/{id}`                     | `parentPath = "posts/{postId}"`                                                                          |
| `follows/{followerId}_{followeeId}` | Directed follow. **Friends** are mutual follows                                                          |

## Key behaviours

- Optimistic likes with rollback on failure.
- Comment / share from `PostCard`; author name opens that person's profile.
- Follow / unfollow from People and profile headers. Mutual follows show as Friends.
- Deep links: `/post/{id}` (configure `EXPO_PUBLIC_DEEP_LINK_HOST`).

## Next steps

```bash
radiance add moderation   # report posts
radiance add presence     # online indicators on profiles
```
