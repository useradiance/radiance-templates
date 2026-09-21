# marketplace starter

Two-sided listings: buyers browse/search, sellers publish, Stripe + roles + maps ready.

```bash
radiance init my-market --template marketplace
```

**Extends:** `expo-app`  
**Default theme pack:** `contrast`

## Who it is for

Classifieds / C2C marketplaces (distinct from single-merchant `e-commerce`).

## Modules installed

| Module                                                 | Role                                     |
| ------------------------------------------------------ | ---------------------------------------- |
| Core + `auth`, `storage`, `forms`, `firestore`         | Listings + media                         |
| `search`                                               | Title prefix search                      |
| `stripe`                                               | Checkout when you wire buy flow          |
| `roles`                                                | Seller / admin claims                    |
| `maps`                                                 | Location-aware listings (extend overlay) |
| `callable-client`, `functions`, `analytics`, `hosting` | Backend + web                            |

## Overlay

| Path                                        | Purpose                                                           |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `overlay/app/(app)/(tabs)/index.tsx`        | Browse + search                                                   |
| `overlay/app/(app)/(tabs)/sell.tsx`         | Create listing form                                               |
| `overlay/app/(app)/listing/[listingId].tsx` | Listing detail                                                    |
| `overlay/lib/listings.ts`                   | Queries + `createListing` (writes `nameLower` / `searchKeywords`) |
| `overlay/lib/registry/tabs.ts`              | Browse / sell / settings                                          |
| `overlay/locales/en.json`                   | Copy                                                              |
| `firebase/firestore.rules.fragment`         | Public read; seller write                                         |

## Data model

| Path            | Shape                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `listings/{id}` | `title`, `description`, `priceInMinorUnits`, `currency`, `sellerId`, `imageUrl?`, `nameLower`, `searchKeywords[]`, `createdAt` |

## Key behaviours

- Sell form creates searchable listings immediately.
- Use `RequireRole` / claims for seller onboarding if you restrict who can sell.
- Wire buy button → `stripe` `startCheckout` with a products mirror or listing-priced callable.

## Next steps

```bash
radiance add chat          # buyer–seller messaging
radiance add moderation
radiance add places        # location search
```
