import { onCall } from 'firebase-functions/v2/https';

import { invalidArgument, requireAuth } from '../lib/errors';
import { deliverEmail, resendKey } from '../lib/email';

export const sendEmail = onCall({ secrets: [resendKey] }, async (request) => {
  requireAuth(request.auth);
  const { to, subject, html, text } = request.data as {
    to?: string;
    subject?: string;
    html?: string;
    text?: string;
  };
  if (!to || !subject) invalidArgument('to and subject required');

  try {
    return await deliverEmail({ to, subject, html, text });
  } catch (error) {
    invalidArgument(error instanceof Error ? error.message : 'Email failed');
  }
});
