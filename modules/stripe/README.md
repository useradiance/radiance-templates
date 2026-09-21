# stripe module

Server-trusted **Checkout Sessions** for one-time payments. Product prices, variants, inventory, and discount codes are loaded from Firestore — never trust client totals.

Install with:

```bash
radiance add stripe
```

**Requires:** `i18n`, `theme`, `auth`, `callable-client`, `functions`  
**Side:** `both`

For subscriptions / Billing Portal, use the `subscriptions` module (can coexist).

## What it does

- Callable `createCheckoutSession` builds a Stripe Checkout Session from Firestore `products`.
- HTTP `stripeWebhook` handles payment completion (idempotent via `runOnce`).
- Client helper `startCheckout` returns `{ sessionId, url }` to open in a browser / Linking.

## What it adds

| Path                                              | Purpose             |
| ------------------------------------------------- | ------------------- |
| `lib/stripe.ts`                                   | `startCheckout`     |
| `lib/__tests__/stripe.test.ts`                    | Client helper tests |
| `functions/src/callable/createCheckoutSession.ts` | Session creation    |
| `functions/src/http/stripeWebhook.ts`             | Webhook skeleton    |

## Client usage

```ts
import { startCheckout } from '@/lib/stripe';
import * as Linking from 'expo-linking';

const { url } = await startCheckout({
  lineItems: [{ productId: 'abc', quantity: 1, variantId: 'm' }],
  discountCode: 'SAVE10',
  successUrl: Linking.createURL('/orders'),
  cancelUrl: Linking.createURL('/cart'),
});
await Linking.openURL(url);
```

## Expected product documents

```
products/{productId}
  name, description?, priceInMinorUnits, currency, available?, inventory?,
  variants?: [{ id, label, priceInMinorUnits?, inventory? }]

discounts/{code}   // lowercase doc id, e.g. save10
  percentOff, active
```

A pending `orders` doc is created with `stripeSessionId`, `lines`, `email`, and `discountCode` when checkout starts. The webhook marks the order paid and decrements inventory. Pair with the `email` module for a receipt.

## Setup checklist

1. Add to `functions/package.json`: `"stripe": "^22.4.0"` (if not already present).
2. Client env: `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` (prompted by `radiance add stripe`).
3. Secrets (prompted into `functions/.secret.local` for the emulator). For production:

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

4. Stripe Dashboard → webhook → `…/stripeWebhook` (events for Checkout completion).
5. Deploy functions; test in Stripe test mode first.

## Notes

- Prefer Checkout Sessions for one-time payments; omit hard-coded `payment_method_types` for dynamic payment methods.
- `@stripe/stripe-react-native` is declared for native Payment Sheet experiments — hosted Checkout URL works without it.
