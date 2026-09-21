import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { OAuthProvider, signInWithCredential } from 'firebase/auth';

import { getFirebaseAuth } from '@/lib/auth';
import { isIOS } from '@/lib/platform';

export const isAppleSignInSupported = isIOS;

/** Apple sign-in. iOS only; the nonce protects against credential replay. */
export async function signInWithApple(): Promise<void> {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  if (!credential.identityToken) {
    throw new Error('Apple did not return an identity token');
  }

  const provider = new OAuthProvider('apple.com');
  await signInWithCredential(
    getFirebaseAuth(),
    provider.credential({ idToken: credential.identityToken, rawNonce }),
  );
}
