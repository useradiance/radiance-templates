/**
 * Stub Apple sign-in — replaced by variants/apple when the apple provider is selected.
 */
export const isAppleSignInSupported = false;

export async function signInWithApple(): Promise<void> {
  throw new Error('Apple sign-in is not enabled in this app.');
}
