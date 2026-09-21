import type { DemoPayload } from '@/lib/demo-types';

const SF = { lat: 37.7749, lng: -122.4194 };

function listing(id: string, title: string, price: number, lat: number, lng: number, uid: string) {
  return {
    id,
    title,
    description: `${title} listed from --demo.`,
    priceInMinorUnits: price,
    currency: 'usd',
    sellerId: uid,
    imageUrl: `https://picsum.photos/seed/radiance-${id}/1200/900`,
    lat,
    lng,
    nameLower: title.toLowerCase(),
    searchKeywords: title.toLowerCase().split(' '),
  };
}

export const DEMO_LISTINGS = (uid: string) => [
  listing('demo-loft', 'Sun loft in Mission', 18900, SF.lat, SF.lng, uid),
  listing('demo-cabin', 'Garden cabin', 14200, SF.lat + 0.02, SF.lng - 0.01, uid),
  listing('demo-studio', 'Canal studio', 12800, SF.lat - 0.015, SF.lng + 0.02, uid),
  listing('demo-view', 'Hill view room', 9800, SF.lat + 0.01, SF.lng + 0.015, uid),
  listing('demo-patio', 'Patio studio', 11000, SF.lat - 0.02, SF.lng - 0.02, uid),
  listing('demo-brick', 'Brick townhouse', 21000, SF.lat + 0.03, SF.lng, uid),
  listing('demo-oak', 'Oak street flat', 15600, SF.lat, SF.lng + 0.03, uid),
  listing('demo-pier', 'Pier loft', 17500, SF.lat - 0.01, SF.lng - 0.03, uid),
];

export function getDemoDocuments(uid: string): DemoPayload {
  const listings = DEMO_LISTINGS(uid);
  return {
    collections: {
      listings,
      products: listings.map((item) => ({
        id: item.id,
        name: item.title,
        description: item.description,
        priceInMinorUnits: item.priceInMinorUnits,
        currency: item.currency,
        available: true,
      })),
    },
  };
}
