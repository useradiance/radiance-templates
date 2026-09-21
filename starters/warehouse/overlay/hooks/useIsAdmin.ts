import { useClaims } from '@/hooks/useClaims';

export function useIsAdmin(): { isAdmin: boolean; loading: boolean } {
  const { claims, loading } = useClaims(true);
  return {
    isAdmin: claims?.admin === true || claims?.role === 'admin',
    loading,
  };
}
