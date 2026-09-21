import { useEffect, useState } from 'react';

import { getFirebaseAuth } from '@/lib/auth';

export type Claims = Record<string, unknown> & { role?: string; admin?: boolean };

/** Fresh ID token claims (forces refresh when `force` is true). */
export function useClaims(force = false): {
  claims: Claims | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [claims, setClaims] = useState<Claims | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const user = getFirebaseAuth().currentUser;
    if (!user) {
      setClaims(null);
      setLoading(false);
      return;
    }
    const token = await user.getIdTokenResult(force);
    setClaims(token.claims as Claims);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
    return getFirebaseAuth().onAuthStateChanged(() => {
      void refresh();
    });
  }, [force]);

  return { claims, loading, refresh };
}

export function hasRole(claims: Claims | null, role: string): boolean {
  if (!claims) return false;
  if (claims.admin === true || claims.role === 'admin') return true;
  return claims.role === role;
}
