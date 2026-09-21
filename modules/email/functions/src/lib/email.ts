import { defineSecret, defineString } from 'firebase-functions/params';
import { logger } from 'firebase-functions';

const resendKey = defineSecret('RESEND_API_KEY');
const emailFrom = defineString('EMAIL_FROM');

export { resendKey, emailFrom };

export async function deliverEmail(input: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}): Promise<{ ok: true; id?: string }> {
  const from = emailFrom.value();
  if (!from) {
    throw new Error('EMAIL_FROM is not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey.value()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html ?? undefined,
      text: input.text ?? undefined,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    logger.warn('email provider error', { status: response.status, detail });
    throw new Error(`Email provider error: ${response.status}`);
  }
  const body = (await response.json()) as { id?: string };
  return { ok: true as const, id: body.id };
}
