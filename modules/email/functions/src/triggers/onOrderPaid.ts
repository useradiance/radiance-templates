import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';

import { deliverEmail, resendKey } from '../lib/email';

function lineSummary(lines: { quantity?: number; name?: string }[] | undefined): string {
  if (!lines?.length) return '';
  return lines.map((line) => `${line.quantity ?? 1}× ${line.name ?? 'Item'}`).join(', ');
}

/**
 * Sends a receipt when an order first becomes `paid`.
 * Pair with the Stripe webhook — this trigger is email-only.
 */
export const onOrderPaid = onDocumentUpdated(
  { document: 'orders/{orderId}', secrets: [resendKey] },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!after || after.status !== 'paid' || before?.status === 'paid') return;

    const to = (after.email as string | undefined) ?? null;
    if (!to) {
      logger.info('order paid without buyer email', { orderId: event.params.orderId });
      return;
    }

    const total = after.totalInMinorUnits ? Number(after.totalInMinorUnits) / 100 : null;
    const currency = String(after.currency ?? 'usd').toUpperCase();
    const summary = lineSummary(after.lines as { quantity?: number; name?: string }[] | undefined);
    const totalLine = total != null ? `${currency} ${total.toFixed(2)}` : 'your order';

    try {
      await deliverEmail({
        to,
        subject: 'Your order is confirmed',
        text: `Thanks for your order (${totalLine}).${summary ? ` ${summary}.` : ''}`,
        html: `<p>Thanks for your order (${totalLine}).</p>${summary ? `<p>${summary}</p>` : ''}`,
      });
    } catch (error) {
      logger.warn('order confirmation email failed', error);
    }
  },
);
