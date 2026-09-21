# email module

Transactional email via a Cloud Functions callable (Resend HTTP API shape).

Install with:

```bash
radiance add email
```

**Requires:** `functions`  
**Side:** `functions` (contracts wire when `callable-client` is present)

## What it does

- Authenticated callable `sendEmail` posts to Resend.
- Firestore trigger `onOrderPaid` emails the buyer when `orders/{id}` first becomes `paid`.
- Secret: `RESEND_API_KEY` (`defineSecret`).
- Param: `EMAIL_FROM` (`defineString` — verified from address).

`radiance add email` prompts for both and writes the secret to `functions/.secret.local`
(emulator) and the from-address to `functions/.env`.

## What it adds

| Path                                    | Purpose                  |
| --------------------------------------- | ------------------------ |
| `functions/src/callable/sendEmail.ts`   | Callable implementation  |
| `functions/src/lib/email.ts`            | Shared Resend helper     |
| `functions/src/triggers/onOrderPaid.ts` | Order confirmation email |

## Client usage

```ts
import { call } from '@/lib/callable';

await call('sendEmail', {
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<p>Hello</p>',
  text: 'Hello',
});
```

## Setup checklist

1. Create a Resend account + verified from-domain.
2. Interactive `radiance add` fills local files; for production:
   ```bash
   firebase functions:secrets:set RESEND_API_KEY
   ```
   Ensure `EMAIL_FROM` is set in `functions/.env` (or as a Functions param).
3. Deploy `sendEmail`.
4. Tighten who may call it (e.g. admin-only) before production — default only requires auth.

## Notes

- Swap Resend for SendGrid / Postmark by changing the HTTP body: add a `SENDGRID_API_KEY`
  (or similar) **secret** and an optional API base URL **param**; keep the callable contract
  stable for the client.
