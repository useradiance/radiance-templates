import {
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentReference,
  type Query,
  type Timestamp,
} from 'firebase/firestore';

import { getDb } from '@/lib/firestore';
import { createLocalId } from '@/lib/optimistic';

export const PRODUCTS_COLLECTION = 'products';
export const ORDERS_COLLECTION = 'orders';

export type ProductVariant = {
  id: string;
  label: string;
  priceInMinorUnits?: number;
  inventory?: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  /** Amount in the smallest currency unit, the way payment providers store money. */
  priceInMinorUnits: number;
  currency: string;
  imageUrl: string | null;
  available: boolean;
  inventory?: number;
  variants?: ProductVariant[];
};

export type OrderLine = {
  productId: string;
  variantId?: string | null;
  name: string;
  priceInMinorUnits: number;
  quantity: number;
};

export type Order = {
  id: string;
  userId: string;
  lines: OrderLine[];
  totalInMinorUnits: number;
  currency: string;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  createdAt: Timestamp | null;
};

export function productsQuery(): Query<Product> {
  return query(
    collection(getDb(), PRODUCTS_COLLECTION),
    where('available', '==', true),
    orderBy('name'),
  ) as Query<Product>;
}

export function productRef(productId: string): DocumentReference<Product> {
  return doc(getDb(), PRODUCTS_COLLECTION, productId) as DocumentReference<Product>;
}

export function ordersQuery(userId: string): Query<Order> {
  return query(
    collection(getDb(), ORDERS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  ) as Query<Order>;
}

/**
 * Records an order in `pending` and returns its id.
 *
 * Prices are re-read server side before payment: never trust a total that came from the
 * client. Wire this id into a payment intent from a Cloud Function.
 */
export async function placeOrder(
  userId: string,
  lines: OrderLine[],
  currency: string,
): Promise<string> {
  const id = createLocalId();
  const totalInMinorUnits = lines.reduce(
    (sum, line) => sum + line.priceInMinorUnits * line.quantity,
    0,
  );

  await setDoc(doc(getDb(), ORDERS_COLLECTION, id), {
    userId,
    lines,
    totalInMinorUnits,
    currency,
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  return id;
}
