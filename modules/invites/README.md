# invites module

Invite codes with create/accept callables and a deep-link accept route.

Install with:

```bash
radiance add invites
```

**Requires:** `auth`, `functions`, `deep-linking`, `callable-client`, `i18n`  
**Side:** `both`

## What it does

- `createInvite` mints a short code document in `invites/{code}`.
- `acceptInvite` marks the invite used and returns optional target metadata.
- Route `/invite/[code]` accepts on open (for universal links / shares).

## What it adds

| Path                                     | Purpose                                             |
| ---------------------------------------- | --------------------------------------------------- |
| `lib/invites.ts`                         | `createInvite`, `acceptInvite` (+ share URL helper) |
| `app/invite/[code].tsx`                  | Accept screen                                       |
| `functions/src/callable/createInvite.ts` | Creates invite docs                                 |
| `functions/src/callable/acceptInvite.ts` | Consumes invite                                     |
| `firebase/firestore.rules.fragment`      | Creator read; writes via Functions only             |
| `locales/en.json`                        | Accepting / failure copy                            |

## Data model

```
invites/{code}
  code: string
  createdBy: string
  targetType?: string | null  // e.g. "workspace" | "project"
  targetId?: string | null
  usedBy?: string | null
  createdAt, usedAt
```

## Usage

```ts
const { code, url } = await createInvite({ targetType: 'workspace', targetId });
// share url via share module
await acceptInvite(code);
```

## Setup checklist

1. Deploy both callables + rules.
2. Set `EXPO_PUBLIC_DEEP_LINK_HOST` and universal-link entitlements (`deep-linking` module).
3. After accept, navigate based on `targetType` / `targetId` (extend the accept screen).
