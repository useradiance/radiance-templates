import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Query,
  type Timestamp,
} from 'firebase/firestore';

import { getDb } from '@/lib/firestore';
import { createLocalId } from '@/lib/optimistic';

export const CATEGORIES_COLLECTION = 'categories';
export const ITEMS_COLLECTION = 'items';
export const WAREHOUSES_COLLECTION = 'warehouses';
export const STOCK_COLLECTION = 'stock';

export type Category = {
  id: string;
  name: string;
  nameLower: string;
  description: string;
  createdAt: Timestamp | null;
};

export type Item = {
  id: string;
  sku: string;
  skuLower: string;
  name: string;
  nameLower: string;
  categoryId: string;
  barcode: string;
  unit: string;
  createdAt: Timestamp | null;
};

export type Warehouse = {
  id: string;
  name: string;
  nameLower: string;
  code: string;
  city: string;
  createdAt: Timestamp | null;
};

export type Stock = {
  id: string;
  itemId: string;
  warehouseId: string;
  quantity: number;
  reorderLevel: number;
  createdAt: Timestamp | null;
};

function lower(value: string): string {
  return value.trim().toLowerCase();
}

export function lookupName(records: { id: string; name: string }[], id: string): string {
  return records.find((record) => record.id === id)?.name ?? '—';
}

export function stockDocId(itemId: string, warehouseId: string): string {
  return `${itemId}_${warehouseId}`;
}

export function isLowStock(row: Stock): boolean {
  return row.quantity <= row.reorderLevel;
}

export function categoriesQuery(): Query<Category> {
  return query(collection(getDb(), CATEGORIES_COLLECTION), orderBy('nameLower')) as Query<Category>;
}

export function itemsQuery(): Query<Item> {
  return query(collection(getDb(), ITEMS_COLLECTION), orderBy('nameLower')) as Query<Item>;
}

export function warehousesQuery(): Query<Warehouse> {
  return query(
    collection(getDb(), WAREHOUSES_COLLECTION),
    orderBy('nameLower'),
  ) as Query<Warehouse>;
}

export function stockQuery(): Query<Stock> {
  return query(collection(getDb(), STOCK_COLLECTION), orderBy('itemId')) as Query<Stock>;
}

export function stockByItemQuery(itemId: string): Query<Stock> {
  return query(
    collection(getDb(), STOCK_COLLECTION),
    where('itemId', '==', itemId),
  ) as Query<Stock>;
}

export function stockByWarehouseQuery(warehouseId: string): Query<Stock> {
  return query(
    collection(getDb(), STOCK_COLLECTION),
    where('warehouseId', '==', warehouseId),
  ) as Query<Stock>;
}

export function itemsByBarcodeQuery(barcode: string): Query<Item> {
  return query(
    collection(getDb(), ITEMS_COLLECTION),
    where('barcode', '==', barcode.trim()),
    limit(1),
  ) as Query<Item>;
}

export async function createCategory(input: {
  name: string;
  description: string;
}): Promise<string> {
  const id = createLocalId();
  const name = input.name.trim();
  await setDoc(doc(getDb(), CATEGORIES_COLLECTION, id), {
    name,
    nameLower: lower(name),
    description: input.description.trim(),
    createdAt: serverTimestamp(),
  });
  return id;
}

export async function updateCategory(
  id: string,
  input: { name: string; description: string },
): Promise<void> {
  const name = input.name.trim();
  await updateDoc(doc(getDb(), CATEGORIES_COLLECTION, id), {
    name,
    nameLower: lower(name),
    description: input.description.trim(),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), CATEGORIES_COLLECTION, id));
}

export async function createItem(input: {
  sku: string;
  name: string;
  categoryId: string;
  barcode: string;
  unit: string;
}): Promise<string> {
  const id = createLocalId();
  const sku = input.sku.trim();
  const name = input.name.trim();
  await setDoc(doc(getDb(), ITEMS_COLLECTION, id), {
    sku,
    skuLower: lower(sku),
    name,
    nameLower: lower(name),
    categoryId: input.categoryId,
    barcode: input.barcode.trim(),
    unit: input.unit.trim() || 'each',
    createdAt: serverTimestamp(),
  });
  return id;
}

export async function updateItem(
  id: string,
  input: {
    sku: string;
    name: string;
    categoryId: string;
    barcode: string;
    unit: string;
  },
): Promise<void> {
  const sku = input.sku.trim();
  const name = input.name.trim();
  await updateDoc(doc(getDb(), ITEMS_COLLECTION, id), {
    sku,
    skuLower: lower(sku),
    name,
    nameLower: lower(name),
    categoryId: input.categoryId,
    barcode: input.barcode.trim(),
    unit: input.unit.trim() || 'each',
  });
}

export async function deleteItem(id: string): Promise<void> {
  await deleteRelatedStock('itemId', id);
  await deleteDoc(doc(getDb(), ITEMS_COLLECTION, id));
}

export async function createWarehouse(input: {
  name: string;
  code: string;
  city: string;
}): Promise<string> {
  const id = createLocalId();
  const name = input.name.trim();
  await setDoc(doc(getDb(), WAREHOUSES_COLLECTION, id), {
    name,
    nameLower: lower(name),
    code: input.code.trim().toUpperCase(),
    city: input.city.trim(),
    createdAt: serverTimestamp(),
  });
  return id;
}

export async function updateWarehouse(
  id: string,
  input: { name: string; code: string; city: string },
): Promise<void> {
  const name = input.name.trim();
  await updateDoc(doc(getDb(), WAREHOUSES_COLLECTION, id), {
    name,
    nameLower: lower(name),
    code: input.code.trim().toUpperCase(),
    city: input.city.trim(),
  });
}

export async function deleteWarehouse(id: string): Promise<void> {
  await deleteRelatedStock('warehouseId', id);
  await deleteDoc(doc(getDb(), WAREHOUSES_COLLECTION, id));
}

export async function upsertStock(input: {
  itemId: string;
  warehouseId: string;
  quantity: number;
  reorderLevel: number;
}): Promise<string> {
  const id = stockDocId(input.itemId, input.warehouseId);
  await setDoc(
    doc(getDb(), STOCK_COLLECTION, id),
    {
      itemId: input.itemId,
      warehouseId: input.warehouseId,
      quantity: input.quantity,
      reorderLevel: input.reorderLevel,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
  return id;
}

export async function updateStock(
  id: string,
  input: { quantity: number; reorderLevel: number },
): Promise<void> {
  await updateDoc(doc(getDb(), STOCK_COLLECTION, id), {
    quantity: input.quantity,
    reorderLevel: input.reorderLevel,
  });
}

export async function deleteStock(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), STOCK_COLLECTION, id));
}

async function deleteRelatedStock(field: 'itemId' | 'warehouseId', value: string): Promise<void> {
  const snap = await getDocs(
    query(collection(getDb(), STOCK_COLLECTION), where(field, '==', value)),
  );
  if (snap.empty) return;
  const db = getDb();
  let batch = writeBatch(db);
  let ops = 0;
  for (const row of snap.docs) {
    batch.delete(row.ref);
    ops += 1;
    if (ops === 400) {
      await batch.commit();
      batch = writeBatch(db);
      ops = 0;
    }
  }
  if (ops > 0) await batch.commit();
}
