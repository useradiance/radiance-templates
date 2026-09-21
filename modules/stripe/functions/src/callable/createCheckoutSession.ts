import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { onCall } from 'firebase-functions/v2/https';
import Stripe from 'stripe';

import { invalidArgument, requireAuth } from '../lib/errors';

const stripeSecret = defineSecret('STRIPE_SECRET_KEY');

type LineInput = { productId: string; quantity: number; variantId?: string };

type ProductVariant = {
  id: string;
  label: string;
  priceInMinorUnits?: number;
  inventory?: number;
};

function applyPercent(unit: number, percentOff: number): number {
  if (percentOff <= 0) return unit;
  return Math.max(0, Math.round(unit * (1 - percentOff / 100)));
}

/**
 * Creates a Checkout Session. Product prices, variants, inventory, and discounts
 * are loaded from Firestore — client totals are ignored.
 */
export const createCheckoutSession = onCall({ secrets: [stripeSecret] }, async (request) => {
  const uid = requireAuth(request.auth);
  const email = (request.auth?.token?.email as string | undefined) ?? null;
  const { lineItems, successUrl, cancelUrl, discountCode } = request.data as {
    lineItems?: LineInput[];
    successUrl?: string;
    cancelUrl?: string;
    discountCode?: string;
  };

  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    invalidArgument('lineItems required');
  }
  if (!successUrl || !cancelUrl) {
    invalidArgument('successUrl and cancelUrl required');
  }

  const db = getFirestore();
  const stripe = new Stripe(stripeSecret.value());

  let percentOff = 0;
  let normalizedCode: string | null = null;
  if (typeof discountCode === 'string' && discountCode.trim()) {
    normalizedCode = discountCode.trim().toLowerCase();
    const discountSnap = await db.collection('discounts').doc(normalizedCode).get();
    if (!discountSnap.exists || discountSnap.data()?.active === false) {
      invalidArgument('invalid discount');
    }
    percentOff = Number(discountSnap.data()?.percentOff ?? 0);
  }

  const items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const persisted: {
    productId: string;
    variantId: string | null;
    name: string;
    quantity: number;
    priceInMinorUnits: number;
  }[] = [];
  let currency = 'usd';
  let totalInMinorUnits = 0;

  for (const line of lineItems) {
    if (!line.productId || line.quantity < 1) {
      invalidArgument('each line needs productId and quantity >= 1');
    }
    const snap = await db.collection('products').doc(line.productId).get();
    if (!snap.exists) {
      invalidArgument(`unknown product ${line.productId}`);
    }
    const product = snap.data()!;
    if (product.available === false) {
      invalidArgument(`product ${line.productId} unavailable`);
    }

    const variants = (product.variants as ProductVariant[] | undefined) ?? [];
    const variant = line.variantId
      ? variants.find((entry) => entry.id === line.variantId)
      : undefined;
    if (line.variantId && !variant) {
      invalidArgument(`unknown variant ${line.variantId}`);
    }

    const unit = Number(variant?.priceInMinorUnits ?? product.priceInMinorUnits);
    const stock = variant?.inventory ?? product.inventory;
    if (typeof stock === 'number' && line.quantity > stock) {
      invalidArgument(`insufficient inventory for ${line.productId}`);
    }

    const charged = applyPercent(unit, percentOff);
    currency = String(product.currency ?? 'usd').toLowerCase();
    const name = variant ? `${product.name} (${variant.label})` : String(product.name ?? 'Item');

    items.push({
      quantity: line.quantity,
      price_data: {
        currency,
        unit_amount: charged,
        product_data: {
          name,
          description: product.description ? String(product.description) : undefined,
        },
      },
    });

    persisted.push({
      productId: line.productId,
      variantId: line.variantId ?? null,
      name,
      quantity: line.quantity,
      priceInMinorUnits: charged,
    });
    totalInMinorUnits += charged * line.quantity;
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: items,
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: uid,
    customer_email: email ?? undefined,
    metadata: {
      userId: uid,
      discountCode: normalizedCode ?? '',
    },
  });

  if (!session.url) {
    invalidArgument('Stripe did not return a checkout URL');
  }

  await db.collection('orders').add({
    userId: uid,
    email,
    status: 'pending',
    stripeSessionId: session.id,
    currency,
    lines: persisted,
    totalInMinorUnits,
    discountCode: normalizedCode,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { sessionId: session.id, url: session.url };
});
