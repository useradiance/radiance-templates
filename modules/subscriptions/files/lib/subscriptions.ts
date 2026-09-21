import { call } from '@/lib/callable';

export async function openBillingPortal(returnUrl: string): Promise<string> {
  const { url } = await call('createBillingPortalSession', { returnUrl });
  return url;
}

export async function startSubscriptionCheckout(input: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionId: string; url: string }> {
  return call('createSubscriptionCheckout', input);
}
