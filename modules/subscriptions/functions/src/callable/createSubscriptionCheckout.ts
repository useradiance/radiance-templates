import { getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { onCall } from 'firebase-functions/v2/https';
import Stripe from 'stripe';

import { invalidArgument, requireAuth } from '../lib/errors';

const stripeSecret = defineSecret('STRIPE_SECRET_KEY');

export const createSubscriptionCheckout = onCall({ secrets: [stripeSecret] }, async (request) => {
  const uid = requireAuth(request.auth);
  const { priceId, successUrl, cancelUrl } = request.data as {
    priceId?: string;
    successUrl?: string;
    cancelUrl?: string;
  };
  if (!priceId || !successUrl || !cancelUrl) {
    invalidArgument('priceId, successUrl and cancelUrl required');
  }

  const db = getFirestore();
  const stripe = new Stripe(stripeSecret.value());
  const entitlement = await db.collection('entitlements').doc(uid).get();
  let customerId = entitlement.data()?.stripeCustomerId as string | undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { firebaseUid: uid },
    });
    customerId = customer.id;
    await db
      .collection('entitlements')
      .doc(uid)
      .set({ stripeCustomerId: customerId, status: 'none', userId: uid }, { merge: true });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: uid,
    metadata: { userId: uid },
  });

  if (!session.url) invalidArgument('Stripe did not return a checkout URL');
  return { sessionId: session.id, url: session.url };
});
