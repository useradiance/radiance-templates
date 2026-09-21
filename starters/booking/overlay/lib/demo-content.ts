import type { AvailabilityRule } from '@/lib/availability';
import type { DemoPayload } from '@/lib/demo-types';
import type { Service } from '@/lib/booking';

const WEEKDAYS: AvailabilityRule = {
  rrule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
  windowStart: '09:00',
  windowEnd: '17:00',
  slotMinutes: 30,
};

export const DEMO_SERVICES: Service[] = [
  {
    id: 'demo-cut',
    name: 'Signature cut',
    durationMinutes: 45,
    priceInMinorUnits: 6500,
    currency: 'usd',
    imageUrl: 'https://picsum.photos/seed/radiance-cut/800/600',
    rating: 4.9,
    category: 'Hair',
    availability: WEEKDAYS,
  },
  {
    id: 'demo-color',
    name: 'Colour & gloss',
    durationMinutes: 90,
    priceInMinorUnits: 14500,
    currency: 'usd',
    imageUrl: 'https://picsum.photos/seed/radiance-color/800/600',
    rating: 4.8,
    category: 'Hair',
  },
  {
    id: 'demo-blowout',
    name: 'Blowout',
    durationMinutes: 30,
    priceInMinorUnits: 4500,
    currency: 'usd',
    imageUrl: 'https://picsum.photos/seed/radiance-blow/800/600',
    rating: 4.7,
    category: 'Hair',
  },
  {
    id: 'demo-nails',
    name: 'Gel manicure',
    durationMinutes: 50,
    priceInMinorUnits: 5500,
    currency: 'usd',
    imageUrl: 'https://picsum.photos/seed/radiance-nails/800/600',
    rating: 4.9,
    category: 'Nails',
  },
  {
    id: 'demo-brows',
    name: 'Brow shape',
    durationMinutes: 20,
    priceInMinorUnits: 2800,
    currency: 'usd',
    imageUrl: 'https://picsum.photos/seed/radiance-brows/800/600',
    rating: 4.8,
    category: 'Face',
  },
  {
    id: 'demo-massage',
    name: 'Deep tissue 60',
    durationMinutes: 60,
    priceInMinorUnits: 12000,
    currency: 'usd',
    imageUrl: 'https://picsum.photos/seed/radiance-massage/800/600',
    rating: 5,
    category: 'Body',
  },
  {
    id: 'demo-facial',
    name: 'Calm facial',
    durationMinutes: 75,
    priceInMinorUnits: 13500,
    currency: 'usd',
    imageUrl: 'https://picsum.photos/seed/radiance-facial/800/600',
    rating: 4.9,
    category: 'Face',
  },
  {
    id: 'demo-beard',
    name: 'Beard trim',
    durationMinutes: 25,
    priceInMinorUnits: 3200,
    currency: 'usd',
    imageUrl: 'https://picsum.photos/seed/radiance-beard/800/600',
    rating: 4.6,
    category: 'Hair',
  },
];

export function getDemoDocuments(uid: string): DemoPayload {
  const starts = new Date();
  starts.setDate(starts.getDate() + 1);
  starts.setHours(10, 0, 0, 0);
  return {
    collections: {
      services: DEMO_SERVICES,
      appointments: [
        {
          id: 'demo-appt-1',
          serviceId: 'demo-cut',
          userId: uid,
          startsAt: starts.toISOString(),
          status: 'booked',
        },
      ],
    },
  };
}
