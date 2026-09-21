import {
  addDoc,
  collection,
  orderBy,
  query,
  serverTimestamp,
  where,
  type Query,
} from 'firebase/firestore';

import { getDb } from '@/lib/firestore';
import { tokenizeForSearch } from '@/lib/search';

export type Listing = {
  id: string;
  title: string;
  description: string;
  priceInMinorUnits: number;
  currency: string;
  sellerId: string;
  imageUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
  nameLower: string;
  searchKeywords: string[];
  createdAt?: { seconds: number } | null;
};

export function listingsQuery(): Query {
  return query(collection(getDb(), 'listings'), orderBy('createdAt', 'desc'));
}

export function sellerListingsQuery(uid: string): Query {
  return query(
    collection(getDb(), 'listings'),
    where('sellerId', '==', uid),
    orderBy('createdAt', 'desc'),
  );
}

export async function createListing(input: {
  title: string;
  description: string;
  priceInMinorUnits: number;
  currency: string;
  sellerId: string;
  imageUrl?: string | null;
}): Promise<string> {
  const ref = await addDoc(collection(getDb(), 'listings'), {
    ...input,
    nameLower: input.title.toLowerCase(),
    searchKeywords: tokenizeForSearch(`${input.title} ${input.description}`),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
