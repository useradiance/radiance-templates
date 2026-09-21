# e-commerce starter

Single-merchant storefront: catalogue, search, MMKV cart module, product detail, and Stripe Checkout with server-trusted totals.

```bash
radiance init my-shop --template e-commerce
```

**Extends:** `expo-app`  
**Default theme pack:** `contrast`

## Who it is for

D2C / brand shops with a product catalogue and one-time Stripe payments (not two-sided marketplaces — use `marketplace` for that).

## Modules installed

| Module                                                      | Role                                   |
| ----------------------------------------------------------- | -------------------------------------- |
| `i18n`, `theme`, `navigation`, `firestore`, `forms`, `auth` | Core app                               |
| `storage`                                                   | Product imagery                        |
| `cart`                                                      | Device-local cart (MMKV)               |
| `search`                                                    | Catalogue prefix search on `nameLower` |
| `stripe`                                                    | Checkout Session callable              |
| `email`                                                     | Receipt when an order is paid          |
| `deep-linking`                                              | Product deep links                     |
| `callable-client`, `functions`, `analytics`, `hosting`      | Backend + web                          |

## Overlay

| Path                                        | Purpose                         |
| ------------------------------------------- | ------------------------------- |
| `overlay/app/(app)/(tabs)/index.tsx`        | Shop grid + search              |
| `overlay/app/(app)/(tabs)/cart.tsx`         | Cart lines + quantities         |
| `overlay/app/(app)/product/[productId].tsx` | Product detail + add to cart    |
| `overlay/app/(app)/checkout.tsx`            | Starts Stripe Checkout          |
| `overlay/components/ProductCard.tsx`        | Grid card                       |
| `overlay/lib/catalog.ts`                    | Products / orders helpers       |
| `overlay/lib/registry/tabs.ts`              | Shop / cart / settings tabs     |
| `overlay/locales/en.json`                   | Shop + cart copy                |
| `firebase/*`                                | Product / order rules + indexes |

## Data model

| Path               | Shape                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `products/{id}`    | `name`, `description`, `priceInMinorUnits`, `currency`, `imageUrl`, `available`, `inventory?`, `variants?`, **`nameLower`** |
| `discounts/{code}` | `percentOff`, `active` (seed `SAVE10`)                                                                                      |
| `orders/{id}`      | Pending order mirror (Stripe webhook completes payment; email module sends a receipt)                                       |

Cart lives only on device via `stores/cart.ts` from the `cart` module.

## Key behaviours

- Search uses `prefixQuery('products', 'nameLower', term)` — seed `nameLower` on products.
- Checkout calls `startCheckout`; Cloud Function reloads prices from Firestore (never trust client totals).
- Deep link products at `/product/{id}`.

## Setup checklist

1. Seed products (include `nameLower`).
2. Configure Stripe secrets + publishable key (`stripe` module README).
3. Point Stripe webhook at `stripeWebhook`.
