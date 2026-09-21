/** Maps Firebase Auth error codes to translation keys so no raw SDK text reaches the UI. */
const ERROR_KEYS: Record<string, string> = {
  'auth/invalid-email': 'auth.errors.invalidEmail',
  'auth/missing-email': 'auth.errors.invalidEmail',
  'auth/user-disabled': 'auth.errors.userDisabled',
  'auth/user-not-found': 'auth.errors.invalidCredentials',
  'auth/wrong-password': 'auth.errors.invalidCredentials',
  'auth/invalid-credential': 'auth.errors.invalidCredentials',
  'auth/email-already-in-use': 'auth.errors.emailInUse',
  'auth/weak-password': 'auth.errors.weakPassword',
  'auth/too-many-requests': 'auth.errors.tooManyRequests',
  'auth/network-request-failed': 'errors.network',
  'auth/popup-closed-by-user': 'auth.errors.cancelled',
  'auth/cancelled-popup-request': 'auth.errors.cancelled',
  'auth/requires-recent-login': 'auth.errors.requiresRecentLogin',
  'auth/account-exists-with-different-credential':
    'auth.errors.accountExistsWithDifferentCredential',
  'auth/operation-not-allowed': 'auth.errors.providerDisabled',
};

export function authErrorKey(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  return ERROR_KEYS[code] ?? 'errors.generic';
}
