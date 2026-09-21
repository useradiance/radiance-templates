import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import Stripe from 'stripe';

import { runOnce } from '../lib/idempotency';

const stripeSecret = defineSecret('STRIPE_SECRET_KEY');
const webhookSecret = defineSecret('STRIPE_WEBHOOK_SECRET');

type OrderLine = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

type ProductVariant = {
  id: string;
  label: string;
  priceInMinorUnits?: number;
  inventory?: number;
};

async function decrementInventory(lines: OrderLine[]): Promise<void> {
  const db = getFirestore();
  await db.runTransaction(async (tx) => {
    for (const line of lines) {
      if (!line.productId || line.quantity < 1) continue;
      const ref = db.collection('products').doc(line.productId);
      const snap = await tx.get(ref);
      if (!snap.exists) continue;
      const product = snap.data()!;
      const variants = [...((product.variants as ProductVariant[] | undefined) ?? [])];
      if (line.variantId) {
        const index = variants.findIndex((entry) => entry.id === line.variantId);
        if (index >= 0 && typeof variants[index].inventory === 'number') {
          variants[index] = {
            ...variants[index],
            inventory: Math.max(0, (variants[index].inventory ?? 0) - line.quantity),
          };
          tx.update(ref, { variants });
          continue;
        }
      }
      if (typeof product.inventory === 'number') {
        tx.update(ref, { inventory: FieldValue.increment(-line.quantity) });
      }
    }
  });
}

/**
 * Stripe webhook — marks orders paid and decrements inventory. Idempotent via runOnce(event.id).
 */
export const stripeWebhook = onRequest(
  { secrets: [stripeSecret, webhookSecret] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    const stripe = new Stripe(stripeSecret.value());

    const signature = req.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      res.status(400).send('Missing signature');
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any).rawBody ?? req.body,
        signature,
        webhookSecret.value(),
      );
    } catch (error) {
      logger.warn('stripe webhook signature failed', error);
      res.status(400).send('Invalid signature');
      return;
    }

    await runOnce(`stripe:${event.id}`, async () => {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const db = getFirestore();
        const orders = await db
          .collection('orders')
          .where('stripeSessionId', '==', session.id)
          .limit(1)
          .get();

        if (!orders.empty) {
          const order = orders.docs[0];
          const lines = (order.data().lines as OrderLine[] | undefined) ?? [];
          await order.ref.set({ status: 'paid', paidAt: new Date() }, { merge: true });
          if (lines.length > 0) {
            await decrementInventory(lines).catch((error) => {
              logger.error('inventory decrement failed', error);
            });
          }
        }
      }
    });

    res.json({ received: true });
  },
);
