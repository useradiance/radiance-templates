import { doc, getDoc, serverTimestamp, setDoc, type DocumentReference } from 'firebase/firestore';

import { getDb } from '@/lib/firestore';
import type { AuthUser } from '@/stores/auth';

export const USERS_COLLECTION = 'users';

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerIds: string[];
  createdAt: unknown;
  updatedAt: unknown;
};

export function userProfileRef(uid: string): DocumentReference {
  return doc(getDb(), USERS_COLLECTION, uid);
}

/**
 * Creates or refreshes `users/{uid}` from the Auth record.
 *
 * Runs on the client so the profile exists on the Spark plan too. When the `functions`
 * module is installed, the `onUserCreated` trigger does the same thing authoritatively and
 * this call simply keeps the document current.
 */
export async function ensureUserProfile(user: AuthUser): Promise<void> {
  const ref = userProfileRef(user.uid);
  const existing = await getDoc(ref);

  const profile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    nameLower: (user.displayName ?? '').toLowerCase(),
    photoURL: user.photoURL,
    providerIds: user.providerIds,
    isAnonymous: user.isAnonymous,
    updatedAt: serverTimestamp(),
    ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
  };

  await setDoc(ref, profile, { merge: true });
}
