import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { useEffect } from 'react';

import { getFirebaseAuth } from '@/lib/auth';
import { isWeb } from '@/lib/platform';

export const googleClientIds = {
  web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
};

/**
 * Ready when any client id is set. The web client id (written by `radiance setup firebase`
 * from Identity Toolkit) is enough for web popup and as Expo AuthSession `clientId`.
 */
export const isGoogleSignInConfigured = Boolean(
  googleClientIds.web || googleClientIds.ios || googleClientIds.android,
);

/**
 * Google sign-in.
 *
 * Web uses a Firebase popup; native goes through an Expo auth session and exchanges the
 * resulting id token for a Firebase credential.
 */
export function useGoogleSignIn(onError?: (error: unknown) => void) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleClientIds.web,
    iosClientId: googleClientIds.ios,
    androidClientId: googleClientIds.android,
  });

  useEffect(() => {
    if (response?.type !== 'success') return;
    const idToken = response.params.id_token;
    if (!idToken) return;

    signInWithCredential(getFirebaseAuth(), GoogleAuthProvider.credential(idToken)).catch((error) =>
      onError?.(error),
    );
  }, [response, onError]);

  const signIn = async () => {
    if (isWeb) {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      return;
    }
    await promptAsync();
  };

  return { signIn, isReady: isWeb || Boolean(request) };
}
