# cart module

Device-local shopping cart persisted with MMKV (via theme) and Zustand.

Install with:

```bash
radiance add cart
```

**Requires:** `i18n`, `theme`

Extracted from the e-commerce starter so any storefront / marketplace can reuse it. Pair with `stripe` for checkout — **server must recompute totals**.

## What it does

- Stores line items: product id, optional variant, name, price (minor units), currency, image, quantity.
- Survives app restarts (MMKV).
- Helpers for cart total and item count.

## What it adds

| Path             | Purpose                                                                    |
| ---------------- | -------------------------------------------------------------------------- |
| `stores/cart.ts` | `useCartStore`, `cartTotal`, `cartCount`, `CartLine` / `CartProduct` types |

## Usage

```ts
import { useCartStore, cartTotal, cartCount } from '@/stores/cart';

const add = useCartStore((s) => s.add);
add({ id, name, priceInMinorUnits, currency, imageUrl, variantId, variantLabel }, 1);

const lines = useCartStore((s) => s.lines);
const total = cartTotal(lines);
```

Actions: `add`, `setQuantity`, `remove`, `clear`.

## Notes

- Not synced to Firestore — intentional for guest carts and offline UX.
- Currency is taken from line items; mixed-currency carts are your responsibility to prevent.
- Checkout: map lines → `startCheckout({ lineItems: lines.map(...) })` from the `stripe` module.
