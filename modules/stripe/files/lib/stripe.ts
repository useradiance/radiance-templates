import { call } from '@/lib/callable';

export type CheckoutLineItem = {
  productId: string;
  quantity: number;
  variantId?: string;
};

/**
 * Creates a Stripe Checkout Session via Cloud Functions and returns the hosted URL.
 * Open `url` in a browser / Linking — amounts are recomputed on the server.
 */
export async function startCheckout(input: {
  lineItems: CheckoutLineItem[];
  successUrl: string;
  cancelUrl: string;
  discountCode?: string;
}): Promise<{ sessionId: string; url: string }> {
  return call('createCheckoutSession', input);
}
