import type { DemoPayload } from '@/lib/demo-types';
import type { Product } from '@/lib/catalog';

function product(
  id: string,
  name: string,
  description: string,
  price: number,
  category: string,
  extras: Partial<Product> = {},
): Product & { nameLower: string; category: string } {
  return {
    id,
    name,
    description,
    priceInMinorUnits: price,
    currency: 'USD',
    imageUrl: `https://picsum.photos/seed/radiance-${id}/900/900`,
    available: true,
    nameLower: name.toLowerCase(),
    category,
    inventory: 24,
    ...extras,
  };
}

export const DEMO_PRODUCTS = [
  product(
    'demo-runner',
    'Aero runner',
    'Lightweight daily trainer with a breathable knit upper.',
    12800,
    'Shoes',
    {
      variants: [
        { id: '7', label: 'US 7', inventory: 4 },
        { id: '8', label: 'US 8', inventory: 8 },
        { id: '9', label: 'US 9', inventory: 6 },
        { id: '10', label: 'US 10', inventory: 3 },
      ],
    },
  ),
  product(
    'demo-jacket',
    'Trail shell',
    'Packable wind shell. Seam-taped for wet mornings.',
    16400,
    'Outerwear',
    {
      variants: [
        { id: 's', label: 'S', inventory: 5 },
        { id: 'm', label: 'M', inventory: 9 },
        { id: 'l', label: 'L', inventory: 4 },
      ],
    },
  ),
  product(
    'demo-tote',
    'Studio tote',
    'Canvas tote with a wide strap and interior pocket.',
    4800,
    'Bags',
  ),
  product(
    'demo-cap',
    'Field cap',
    'Unstructured six-panel cap. Cotton twill.',
    3200,
    'Accessories',
    {
      inventory: 18,
    },
  ),
  product('demo-mug', 'Daylight mug', '12oz ceramic mug. Speckled glaze.', 2400, 'Home'),
  product(
    'demo-hoodie',
    'Quiet hoodie',
    'Heavyweight fleece with a set-in sleeve.',
    8900,
    'Apparel',
    {
      variants: [
        { id: 's', label: 'S', inventory: 6 },
        { id: 'm', label: 'M', inventory: 10 },
        { id: 'l', label: 'L', inventory: 7 },
        { id: 'xl', label: 'XL', inventory: 2 },
      ],
    },
  ),
  product('demo-socks', 'Merino crew', 'Three-pack merino crew socks.', 2800, 'Accessories'),
  product('demo-bottle', 'Carry bottle', 'Insulated 750ml bottle. Loop lid.', 3600, 'Home'),
  product(
    'demo-shorts',
    'Mile shorts',
    '5-inch running shorts with a brief liner.',
    5400,
    'Apparel',
    {
      variants: [
        { id: 's', label: 'S', inventory: 8 },
        { id: 'm', label: 'M', inventory: 12 },
        { id: 'l', label: 'L', inventory: 5 },
      ],
    },
  ),
  product('demo-lamp', 'Desk lamp', 'Warm LED task lamp with a dimmer.', 7200, 'Home', {
    inventory: 11,
  }),
];

export const DEMO_CATEGORIES = [
  'All',
  'Shoes',
  'Apparel',
  'Outerwear',
  'Bags',
  'Accessories',
  'Home',
];

export function getDemoDocuments(_uid: string): DemoPayload {
  return {
    collections: {
      products: DEMO_PRODUCTS,
      discounts: [{ id: 'save10', code: 'SAVE10', percentOff: 10, active: true }],
    },
  };
}
