import type { DemoPayload } from '@/lib/demo-types';
import type { Category, Item, Stock, Warehouse } from '@/lib/inventory';
import { stockDocId } from '@/lib/inventory';

export const DEMO_CATEGORIES: Category[] = [
  {
    id: 'cat-fasteners',
    name: 'Fasteners',
    nameLower: 'fasteners',
    description: 'Bolts, nuts, washers, ties',
    createdAt: null,
  },
  {
    id: 'cat-packaging',
    name: 'Packaging',
    nameLower: 'packaging',
    description: 'Cartons, wrap, labels',
    createdAt: null,
  },
  {
    id: 'cat-safety',
    name: 'Safety',
    nameLower: 'safety',
    description: 'PPE for the floor',
    createdAt: null,
  },
  {
    id: 'cat-tools',
    name: 'Tools',
    nameLower: 'tools',
    description: 'Hand tools and kits',
    createdAt: null,
  },
];

export const DEMO_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-austin',
    name: 'Austin DC',
    nameLower: 'austin dc',
    code: 'AUS',
    city: 'Austin',
    createdAt: null,
  },
  {
    id: 'wh-rotterdam',
    name: 'Rotterdam DC',
    nameLower: 'rotterdam dc',
    code: 'RTM',
    city: 'Rotterdam',
    createdAt: null,
  },
  {
    id: 'wh-singapore',
    name: 'Singapore DC',
    nameLower: 'singapore dc',
    code: 'SIN',
    city: 'Singapore',
    createdAt: null,
  },
];

export const DEMO_ITEMS: Item[] = [
  item('item-bolt', 'FST-M8-40', 'M8 hex bolt 40mm', 'cat-fasteners', '0000000000011', 'each'),
  item('item-nut', 'FST-M8-NUT', 'M8 nylon locknut', 'cat-fasteners', '0000000000012', 'each'),
  item('item-washer', 'FST-WSH-8', 'Washer 8mm', 'cat-fasteners', '0000000000013', 'each'),
  item('item-tie', 'FST-TIE-200', 'Cable tie 200mm', 'cat-fasteners', '0000000000014', 'bag'),
  item('item-carton', 'PKG-CTN-12', 'Carton 12×12×12', 'cat-packaging', '0000000000021', 'each'),
  item('item-wrap', 'PKG-WRAP-500', 'Pallet wrap 500m', 'cat-packaging', '0000000000022', 'roll'),
  item('item-label', 'PKG-LBL-1K', 'Label roll 1000', 'cat-packaging', '0000000000023', 'roll'),
  item('item-gloves', 'SAF-GLV-L', 'Nitrile gloves L', 'cat-safety', '0000000000031', 'box'),
  item('item-glasses', 'SAF-GLS-CLR', 'Safety glasses', 'cat-safety', '0000000000032', 'pair'),
  item('item-plugs', 'SAF-EAR-200', 'Ear plugs 200ct', 'cat-safety', '0000000000033', 'box'),
  item('item-torque', 'TLS-TQ-12', 'Torque wrench 1/2', 'cat-tools', '0000000000041', 'each'),
  item('item-hex', 'TLS-HEX-M', 'Hex key set metric', 'cat-tools', '0000000000042', 'set'),
];

function item(
  id: string,
  sku: string,
  name: string,
  categoryId: string,
  barcode: string,
  unit: string,
): Item {
  return {
    id,
    sku,
    skuLower: sku.toLowerCase(),
    name,
    nameLower: name.toLowerCase(),
    categoryId,
    barcode,
    unit,
    createdAt: null,
  };
}

function stock(itemId: string, warehouseId: string, quantity: number, reorderLevel: number): Stock {
  return {
    id: stockDocId(itemId, warehouseId),
    itemId,
    warehouseId,
    quantity,
    reorderLevel,
    createdAt: null,
  };
}

export const DEMO_STOCK: Stock[] = [
  stock('item-bolt', 'wh-austin', 420, 80),
  stock('item-bolt', 'wh-rotterdam', 60, 80),
  stock('item-nut', 'wh-austin', 900, 120),
  stock('item-nut', 'wh-singapore', 140, 80),
  stock('item-washer', 'wh-austin', 50, 100),
  stock('item-tie', 'wh-rotterdam', 240, 40),
  stock('item-carton', 'wh-austin', 75, 40),
  stock('item-carton', 'wh-rotterdam', 18, 30),
  stock('item-wrap', 'wh-singapore', 22, 12),
  stock('item-label', 'wh-austin', 8, 16),
  stock('item-gloves', 'wh-austin', 64, 24),
  stock('item-gloves', 'wh-rotterdam', 12, 24),
  stock('item-glasses', 'wh-singapore', 90, 20),
  stock('item-plugs', 'wh-austin', 5, 10),
  stock('item-torque', 'wh-austin', 6, 4),
  stock('item-hex', 'wh-rotterdam', 14, 6),
  stock('item-hex', 'wh-singapore', 3, 6),
];

export function getDemoDocuments(_uid: string): DemoPayload {
  return {
    collections: {
      categories: DEMO_CATEGORIES,
      items: DEMO_ITEMS,
      warehouses: DEMO_WAREHOUSES,
      stock: DEMO_STOCK,
    },
  };
}
