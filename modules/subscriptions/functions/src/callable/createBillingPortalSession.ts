import { getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { onCall } from 'firebase-functions/v2/https';
import Stripe from 'stripe';

import { invalidArgument, requireAuth } from '../lib/errors';

const stripeSecret = defineSecret('STRIPE_SECRET_KEY');

export const createBillingPortalSession = onCall({ secrets: [stripeSecret] }, async (request) => {
  const uid = requireAuth(request.auth);
  const { returnUrl } = request.data as { returnUrl?: string };
  if (!returnUrl) invalidArgument('returnUrl required');

  const snap = await getFirestore().collection('entitlements').doc(uid).get();
  const customerId = snap.data()?.stripeCustomerId as string | undefined;
  if (!customerId) invalidArgument('No Stripe customer for this user');

  const stripe = new Stripe(stripeSecret.value());
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return { url: session.url };
});
