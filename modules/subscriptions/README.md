# subscriptions module

Stripe **Billing** (recurring): Checkout in `subscription` mode, Customer Portal, webhook → Firestore entitlements.

Install with:

```bash
radiance add subscriptions
```

**Requires:** `i18n`, `theme`, `auth`, `callable-client`, `functions`  
**Side:** `both`

Companion to the one-time `stripe` (Checkout Session) module — both can coexist.

## What it does

- Creates Stripe Customers and subscription Checkout Sessions (server-side).
- Opens the Stripe Billing Portal for plan changes / cancellation.
- Mirrors subscription lifecycle into `entitlements/{uid}` via webhook.
- Client hook `useEntitlement` / `isEntitled` for feature gates.

## What it adds

| Path                                                   | Purpose                                          |
| ------------------------------------------------------ | ------------------------------------------------ |
| `lib/subscriptions.ts`                                 | `openBillingPortal`, `startSubscriptionCheckout` |
| `hooks/useEntitlement.ts`                              | Live entitlement doc + `isEntitled` helper       |
| `functions/src/callable/createSubscriptionCheckout.ts` | Subscription Checkout Session                    |
| `functions/src/callable/createBillingPortalSession.ts` | Billing Portal session                           |
| `functions/src/http/stripeSubscriptionWebhook.ts`      | `customer.subscription.*` → entitlements         |
| `firebase/firestore.rules.fragment`                    | Self-read entitlements; writes Admin-only        |

## Entitlement document

`entitlements/{uid}`:

```ts
{
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';
  priceId?: string;
  currentPeriodEnd?: { seconds: number } | null;
  stripeCustomerId?: string;
}
```

## Client usage

```ts
import { startSubscriptionCheckout, openBillingPortal } from '@/lib/subscriptions';
import { useEntitlement, isEntitled } from '@/hooks/useEntitlement';

const { data } = useEntitlement();
if (isEntitled(data)) {
  /* unlock feature */
}

const { url } = await startSubscriptionCheckout({
  priceId: process.env.EXPO_PUBLIC_STRIPE_PRICE_ID!,
  successUrl,
  cancelUrl,
});
```

## Setup checklist

1. Add `stripe` to `functions/package.json` if missing.
2. Client env: `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` (prompted by `radiance add`), plus your Price id (`EXPO_PUBLIC_STRIPE_PRICE_ID` recommended).
3. Secrets (prompted into `functions/.secret.local` for the emulator). For production:
   ```bash
   firebase functions:secrets:set STRIPE_SECRET_KEY
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
   ```
4. Stripe Dashboard → webhook endpoint for `stripeSubscriptionWebhook` listening to `customer.subscription.created|updated|deleted`.
5. Deploy callables + HTTP function; deploy rules.

## Notes

- Never trust the client for plan state — gate server features on Admin-read entitlements or verify the subscription via Stripe.
- Put `userId` / `firebaseUid` in Stripe subscription metadata so the webhook can map customers.
