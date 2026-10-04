# roles module

Role-based access via Firebase Auth **custom claims**, client guards, and Firestore rules helpers.

Install with:

```bash
radiance add roles
```

**Requires:** `auth`, `functions`, `callable-client`, `i18n`, `theme`  
**Side:** `both` (app + Cloud Functions)

## What it does

- Admin-only callable `setUserClaims` sets or clears a `role` claim (and `admin: true` when role is `admin`).
- Client hooks/components read the ID token claims and gate UI.
- Rules fragment exposes `isAdmin()` / `hasRole(role)` for security rules.

## What it adds

| Path | Purpose |
| ----------------------------------------- | ------------------------------------------------- | --------------------- |
| `hooks/useClaims.ts` | `useClaims`, `hasRole` — reads `getIdTokenResult` |
| `components/RequireRole.tsx` | Renders children only when the user has the role |
| `lib/roles.ts` | `setUserRole(uid, role \\                         | null)` client wrapper |
| `functions/src/callable/setUserClaims.ts` | Admin-gated Admin SDK claims writer |
| `firebase/firestore.rules.fragment` | `isAdmin()` / `hasRole(role)` helpers |
| `locales/en.json` | Denied / checking copy |

## Identity model

Claims shape (on the ID token):

```ts
{ role?: string; admin?: boolean; /* plus Firebase defaults */ }
```

- `role === 'admin'` or `admin === true` ⇒ full admin.
- Client checks are **UX only** — always enforce in rules and callables.

## Bootstrap

Install the `admin` module (`radiance add admin`) and open `/admin`. The first signed-in user can claim admin. Or set claims outside the app:

```bash
# example with Firebase Admin / CLI script
# set custom claims { role: 'admin', admin: true } on your uid
```

Then use:

```ts
import { setUserRole } from '@/lib/roles';
await setUserRole(otherUid, 'seller');
await setUserRole(otherUid, null); // clear
```

## UI gating

```tsx
import { RequireRole } from '@/components/RequireRole';

<RequireRole role="admin">
  <AdminPanel />
</RequireRole>;
```

## Setup checklist

1. Deploy functions: `firebase deploy --only functions:setUserClaims`
2. Merge / deploy Firestore rules so `isAdmin()` is available
3. After changing claims, clients must refresh the ID token (`useClaims(true)` forces refresh)
