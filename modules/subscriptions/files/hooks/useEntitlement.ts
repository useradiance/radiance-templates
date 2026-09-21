import { doc } from 'firebase/firestore';

import { useDocument } from '@/hooks/useDocument';
import { getDb } from '@/lib/firestore';
import { useAuthStore } from '@/stores/auth';

export type Entitlement = {
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';
  priceId?: string;
  currentPeriodEnd?: { seconds: number } | null;
  stripeCustomerId?: string;
};

export function useEntitlement() {
  const uid = useAuthStore((s) => s.user?.uid ?? null);
  return useDocument<Entitlement>(
    () => doc(getDb(), 'entitlements', uid!),
    uid ? `entitlement:${uid}` : null,
  );
}

export function isEntitled(entitlement: Entitlement | null | undefined): boolean {
  return entitlement?.status === 'active' || entitlement?.status === 'trialing';
}
