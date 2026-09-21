import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';

import { getFirebaseAuth } from '@/lib/auth';
import { isWeb } from '@/lib/platform';

let confirmation: ConfirmationResult | null = null;

/** Web: invisible reCAPTCHA + SMS. Native: wire RNFirebase phone auth in a development build. */
export async function startPhoneSignIn(phoneNumber: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!isWeb) {
    throw new Error(
      'Native phone auth needs a development build — use RNFirebase Auth phone APIs or Expo SMS.',
    );
  }
  const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
  confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
}

export async function confirmPhoneSignIn(code: string): Promise<void> {
  if (!confirmation) throw new Error('Call startPhoneSignIn first');
  await confirmation.confirm(code);
  confirmation = null;
}
