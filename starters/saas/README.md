# saas starter

Workspaces + members/invites + Stripe subscriptions + Remote Config feature flags + settings/roles.

```bash
radiance init my-saas --template saas
# optional sample workspaces + teammate profiles:
radiance init my-saas --template saas --demo
```

**Extends:** `expo-app`  
**Default theme pack:** `ink`

## Who it is for

B2B / multi-tenant tools with billing and gated features.

**Roles vs workspace members:** `roles` is **app-wide** Auth custom claims (`admin`, etc.) via `RequireRole` / `setUserClaims`. Workspace seats use `memberIds` + `memberRoles` (`admin` | `member`); the owner is always `ownerId`. Owners can invite (callable), add by uid, change seat roles, and remove members.

## Modules installed

| Module                                                 | Role                                              |
| ------------------------------------------------------ | ------------------------------------------------- |
| Core + `auth`, `firestore`, `forms`                    | App                                               |
| `roles`                                                | Admin claims / `RequireRole`                      |
| `invites`, `deep-linking`, `share`                     | Invite codes + share sheet                        |
| `demo-data`                                            | Optional first-run seed (`EXPO_PUBLIC_SEED_DEMO`) |
| `subscriptions`                                        | Billing Checkout + portal + entitlements          |
| `settings`                                             | Appearance settings section                       |
| `remote-config`                                        | e.g. `feature_billing_enabled`                    |
| `functions`, `callable-client`, `hosting`, `analytics` | Backend + web                                     |

## Overlay

| Path                                            | Purpose                                   |
| ----------------------------------------------- | ----------------------------------------- |
| `overlay/app/(app)/(tabs)/index.tsx`            | Workspace list + create                   |
| `overlay/app/(app)/(tabs)/people.tsx`           | User directory + role controls for admins |
| `overlay/app/(app)/workspace/[workspaceId].tsx` | Members, invite, add/remove, seat roles   |
| `overlay/app/(app)/(tabs)/billing.tsx`          | Entitlement status, subscribe, portal     |
| `overlay/lib/workspaces.ts`                     | Workspace + member helpers                |
| `overlay/lib/demo-content.ts`                   | Seed workspaces + demo profiles           |
| `overlay/lib/registry/tabs.ts`                  | Workspace / billing / settings            |
| `overlay/locales/en.json`                       | Copy                                      |
| `firebase/firestore.rules.fragment`             | Member-scoped workspaces                  |

## Data model

| Path                 | Shape                                           |
| -------------------- | ----------------------------------------------- |
| `workspaces/{id}`    | `name`, `ownerId`, `memberIds[]`, `memberRoles` |
| `users/{uid}`        | Profiles for member list (seed + auth)          |
| `invites/{code}`     | Invite codes (`targetType: workspace`)          |
| `entitlements/{uid}` | From `subscriptions` module                     |

## Key behaviours

- Billing tab respects Remote Config `feature_billing_enabled`.
- Set `EXPO_PUBLIC_STRIPE_PRICE_ID` for the subscribe button.
- Set `EXPO_PUBLIC_SEED_DEMO=true` (or `radiance init --demo`) for Acme Ops + Northwind sample teams.
- Seed first admin claim before using `roles` callables.

## Setup checklist

1. Stripe Billing + webhook (`subscriptions` README).
2. Remote Config parameters.
3. Optional: `EXPO_PUBLIC_DEEP_LINK_HOST` for absolute invite URLs.
