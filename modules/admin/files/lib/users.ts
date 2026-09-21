import { collection, query } from 'firebase/firestore';

import { getDb } from '@/lib/firestore';

export type AppUser = {
  id: string;
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  role?: string | null;
};

/** All profile documents. Sort client-side — displayName may be null. */
export function usersQuery() {
  return query(collection(getDb(), 'users'));
}
