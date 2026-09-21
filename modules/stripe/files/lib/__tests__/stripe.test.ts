import { startCheckout } from '@/lib/stripe';

describe('stripe client helper', () => {
  it('exports startCheckout', () => {
    expect(typeof startCheckout).toBe('function');
  });
});
