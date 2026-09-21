/**
 * Session source of truth for route guards.
 *
 * The scaffold ships a permissive stub so the app runs before authentication exists.
 * The `auth` module replaces this file with a real implementation backed by Firebase Auth.
 */
export type SessionState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmailSatisfied: boolean;
  userId: string | null;
};

export function useSession(): SessionState {
  return { isLoading: false, isAuthenticated: true, isEmailSatisfied: true, userId: null };
}
