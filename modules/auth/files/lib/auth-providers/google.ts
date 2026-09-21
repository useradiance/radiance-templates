/**
 * Stub Google sign-in — replaced by variants/google when the google provider is selected.
 */
export const isGoogleSignInConfigured = false;

export function useGoogleSignIn(_onError?: (error: unknown) => void) {
  return {
    signIn: async () => {
      throw new Error('Google sign-in is not enabled in this app.');
    },
    isReady: false,
  };
}
