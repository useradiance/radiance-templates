import { getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import Stripe from 'stripe';

import { runOnce } from '../lib/idempotency';

const stripeSecret = defineSecret('STRIPE_SECRET_KEY');
const webhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');

async function mirrorSubscription(sub: Stripe.Subscription) {
  const uid = (sub.metadata?.userId || sub.metadata?.firebaseUid) as string | undefined;
  if (!uid) return;
  const status = sub.status as string;
  const mapped =
    status === 'active' || status === 'trialing' || status === 'past_due' || status === 'canceled'
      ? status
      : 'none';
  const item = sub.items.data[0];
  const periodEnd = item?.current_period_end;
  await getFirestore()
    .collection('entitlements')
    .doc(uid)
    .set(
      {
        status: mapped,
        priceId: item?.price.id ?? null,
        currentPeriodEnd: periodEnd ? { seconds: periodEnd } : null,
        stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
        updatedAt: new Date(),
      },
      { merge: true },
    );
}

export const stripeSubscriptionWebhook = onRequest(
  { secrets: [stripeSecret, webhookSecret] },
  async (req, res) => {
    const stripe = new Stripe(stripeSecret.value());
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers['stripe-signature'] as string,
        webhookSecret.value(),
      );
    } catch {
      res.status(400).send('Invalid signature');
      return;
    }

    await runOnce(`stripe_${event.id}`, async () => {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await mirrorSubscription(event.data.object as Stripe.Subscription);
          break;
        default:
          break;
      }
    });

    res.json({ received: true });
  },
);
