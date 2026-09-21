import {
  collection,
  doc,
  limit,
  query,
  type DocumentReference,
  type Query,
} from 'firebase/firestore';

import { getDb } from '@/lib/firestore';

export const PEOPLE_COLLECTION = 'users';

export type Person = {
  id: string;
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  bio?: string | null;
  email?: string | null;
};

export function peopleQuery(): Query<Person> {
  return query(collection(getDb(), PEOPLE_COLLECTION), limit(50)) as Query<Person>;
}

export function personRef(uid: string): DocumentReference<Person> {
  return doc(getDb(), PEOPLE_COLLECTION, uid) as DocumentReference<Person>;
}

export function personFromAuth(user: {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}): Person {
  return {
    id: user.uid,
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL,
    email: user.email,
  };
}
