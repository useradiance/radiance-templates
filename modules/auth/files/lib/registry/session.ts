import { useAuthStore } from '@/stores/auth';
import { enforceEmailVerification } from '@/lib/auth-config';

/** Session source of truth for route guards, backed by Firebase Auth. */
export type SessionState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  /** False when enforceEmailVerification is on and the user has not verified. */
  isEmailSatisfied: boolean;
  userId: string | null;
};

export function useSession(): SessionState {
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  const isAuthenticated = user !== null;
  const isEmailSatisfied =
    !enforceEmailVerification ||
    !user ||
    user.isAnonymous ||
    user.emailVerified ||
    user.providerIds.some((id) => id === 'google.com' || id === 'apple.com');

  return {
    isLoading: isInitializing,
    isAuthenticated,
    isEmailSatisfied,
    userId: user?.uid ?? null,
  };
}
