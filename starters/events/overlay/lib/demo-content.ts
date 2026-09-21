import type { DemoPayload } from '@/lib/demo-types';
import type { EventItem } from '@/lib/event-items';

function daysFromNow(days: number, hour = 19) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return { seconds: Math.floor(date.getTime() / 1000) };
}

export const DEMO_EVENTS: EventItem[] = [
  {
    id: 'demo-launch',
    title: 'Launch night',
    description: 'First look at the season with drinks on the mezzanine.',
    startsAt: daysFromNow(3),
    venue: 'Main hall',
    city: 'San Francisco',
    coverUrl: 'https://picsum.photos/seed/radiance-launch/1600/900',
    priceInMinorUnits: 1500,
    currency: 'usd',
  },
  {
    id: 'demo-jazz',
    title: 'Late jazz in the courtyard',
    description: 'A quartet, string lights, and a cash bar.',
    startsAt: daysFromNow(5, 21),
    venue: 'Oak courtyard',
    city: 'Oakland',
    coverUrl: 'https://picsum.photos/seed/radiance-jazz/1600/900',
    priceInMinorUnits: 0,
    currency: 'usd',
  },
  {
    id: 'demo-run',
    title: 'Sunrise ridge run',
    description: '8km easy. Coffee after.',
    startsAt: daysFromNow(2, 7),
    venue: 'Twin Peaks trailhead',
    city: 'San Francisco',
    coverUrl: 'https://picsum.photos/seed/radiance-run/1600/900',
    priceInMinorUnits: 0,
    currency: 'usd',
  },
  {
    id: 'demo-supper',
    title: 'Community supper',
    description: 'Long table, seasonal menu, bring a bottle.',
    startsAt: daysFromNow(8, 18),
    venue: 'The warehouse',
    city: 'San Francisco',
    coverUrl: 'https://picsum.photos/seed/radiance-supper/1600/900',
    priceInMinorUnits: 4500,
    currency: 'usd',
  },
  {
    id: 'demo-film',
    title: 'Outdoor film: golden hour',
    description: 'Blankets on the lawn. Soundtrack live.',
    startsAt: daysFromNow(12, 20),
    venue: 'Dolores lawn',
    city: 'San Francisco',
    coverUrl: 'https://picsum.photos/seed/radiance-film/1600/900',
    priceInMinorUnits: 1200,
    currency: 'usd',
  },
  {
    id: 'demo-maker',
    title: 'Maker market',
    description: 'Prints, ceramics, and small-batch food.',
    startsAt: daysFromNow(6, 11),
    venue: 'Ferry shed',
    city: 'San Francisco',
    coverUrl: 'https://picsum.photos/seed/radiance-maker/1600/900',
    priceInMinorUnits: 0,
    currency: 'usd',
  },
];

export function getDemoDocuments(uid: string): DemoPayload {
  return {
    collections: {
      events: DEMO_EVENTS.map((event) => ({ ...event, organizerId: uid })),
      products: DEMO_EVENTS.filter((event) => (event.priceInMinorUnits ?? 0) > 0).map((event) => ({
        id: event.id,
        name: `${event.title} ticket`,
        description: event.description,
        priceInMinorUnits: event.priceInMinorUnits,
        currency: event.currency,
        available: true,
      })),
    },
    nested: [
      {
        parent: 'events',
        parentId: 'demo-jazz',
        subcollection: 'rsvps',
        id: uid,
        userId: uid,
        eventId: 'demo-jazz',
      },
      {
        parent: 'events',
        parentId: 'demo-run',
        subcollection: 'rsvps',
        id: uid,
        userId: uid,
        eventId: 'demo-run',
      },
    ],
  };
}
