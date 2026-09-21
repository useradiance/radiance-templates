# warehouse starter

Admin-style inventory: categories, items, warehouses, and on-hand stock in a column grid with show/edit/delete. Signed-in viewers read; admins write.

```bash
radiance init my-warehouse --template warehouse
# optional sample catalogue + stock:
radiance init my-warehouse --template warehouse --demo
```

**Extends:** `expo-app`  
**Default theme pack:** `ink`

## Who it is for

Internal ops tools that look like react-admin: a data grid, related resources, and role-gated mutations. Not a storefront (use `e-commerce`) and not a task list (use `productivity`).

## Modules installed

| Module                                                             | Role                                                          |
| ------------------------------------------------------------------ | ------------------------------------------------------------- |
| Core + `auth`, `firestore`, `forms`                                | App                                                           |
| `roles`, `admin`                                                   | First-admin bootstrap, `RequireRole` / claims, user directory |
| `search`                                                           | SKU / name prefix search on items                             |
| `barcode`                                                          | Scan a barcode to open the matching item                      |
| `demo-data`                                                        | Optional first-run seed (`EXPO_PUBLIC_SEED_DEMO`)             |
| `functions`, `callable-client`, `hosting`, `analytics`, `settings` | Backend + web + appearance                                    |

## Overlay

| Path                                            | Purpose                                           |
| ----------------------------------------------- | ------------------------------------------------- |
| `overlay/app/(app)/(tabs)/index.tsx`            | Stock grid (filter by warehouse)                  |
| `overlay/app/(app)/(tabs)/items.tsx`            | Item grid + search + scan                         |
| `overlay/app/(app)/(tabs)/locations.tsx`        | Warehouse grid                                    |
| `overlay/app/(app)/(tabs)/categories.tsx`       | Category grid                                     |
| `overlay/app/(app)/(tabs)/settings.tsx`         | Account, appearance, admin console                |
| `overlay/app/(app)/item/[itemId].tsx`           | Phone show/edit (and `/item/new`)                 |
| `overlay/app/(app)/warehouse/[warehouseId].tsx` | Phone show/edit                                   |
| `overlay/app/(app)/category/[categoryId].tsx`   | Phone show/edit                                   |
| `overlay/app/(app)/stock/[stockId].tsx`         | Phone show/edit                                   |
| `overlay/app/(app)/scan.tsx`                    | Barcode → item lookup                             |
| `overlay/components/ResourceEditor.tsx`         | DataTable + SplitView + delete confirm            |
| `overlay/components/InventoryForms.tsx`         | Create/edit/show forms                            |
| `overlay/lib/inventory.ts`                      | Types, queries, CRUD                              |
| `overlay/lib/demo-content.ts`                   | Seed catalogue                                    |
| `overlay/lib/registry/tabs.ts`                  | Stock / items / locations / categories / settings |
| `overlay/locales/en.json`                       | Copy                                              |
| `firebase/firestore.rules.fragment`             | Signed-in read, `isAdmin()` write                 |
| `firebase/firestore.indexes.json`               | Stock by item / warehouse                         |

## Data model

| Path              | Shape                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------- |
| `categories/{id}` | `name`, `nameLower`, `description`                                                     |
| `items/{id}`      | `sku`, `skuLower`, `name`, `nameLower`, `categoryId`, `barcode`, `unit`                |
| `warehouses/{id}` | `name`, `nameLower`, `code`, `city`                                                    |
| `stock/{id}`      | `itemId`, `warehouseId`, `quantity`, `reorderLevel` (`id` is `{itemId}_{warehouseId}`) |

## Key behaviours

- Desktop: `DataTable` + collapsible `SplitView` detail. Phone: stacked rows, then a stack route for show/edit.
- Grids include a freeform search; mark a column `filterable` to add it to Add filter.
- Admins see New / Edit / Delete. Viewers see the same grids as read-only. Rules enforce writes.
- First signed-in user claims admin from **Settings → Admin**.
- Item search uses `prefixQuery` on `nameLower` and `skuLower`.
- Scan looks up `items.barcode` and opens that item.
- Deleting an item or warehouse cascades its stock rows.
- Set `EXPO_PUBLIC_SEED_DEMO=true` (or `radiance init --demo`) for sample DCs and SKUs. Callable seed writes with the Admin SDK; the client fallback needs an admin claim.

## Setup checklist

1. Sign in, then become the first admin from Settings.
2. Optional: `EXPO_PUBLIC_SEED_DEMO=true` for Austin / Rotterdam / Singapore stock.
3. Development build if you want camera barcode scanning.
