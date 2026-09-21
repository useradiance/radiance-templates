import type { DemoPayload } from '@/lib/demo-types';
import type { Location } from '@/lib/locations';

export const DEMO_LOCATIONS: (Location & { imageUrl?: string; neighborhood?: string })[] = [
  {
    id: 'demo-market',
    name: 'Market Street',
    address: '1 Market Street',
    lat: 37.7946,
    lng: -122.395,
    hours: 'Open · closes 8pm',
    neighborhood: 'Embarcadero',
    imageUrl: 'https://picsum.photos/seed/radiance-market/900/700',
  },
  {
    id: 'demo-oak',
    name: 'Oak & Fillmore',
    address: '2100 Fillmore Street',
    lat: 37.7894,
    lng: -122.434,
    hours: 'Open · closes 7pm',
    neighborhood: 'Pacific Heights',
    imageUrl: 'https://picsum.photos/seed/radiance-oak/900/700',
  },
  {
    id: 'demo-valencia',
    name: 'Valencia',
    address: '900 Valencia Street',
    lat: 37.757,
    lng: -122.421,
    hours: 'Open · closes 9pm',
    neighborhood: 'Mission',
    imageUrl: 'https://picsum.photos/seed/radiance-valencia/900/700',
  },
  {
    id: 'demo-ferry',
    name: 'Ferry Building',
    address: '1 Ferry Building',
    lat: 37.7955,
    lng: -122.3937,
    hours: 'Open · closes 6pm',
    neighborhood: 'Embarcadero',
    imageUrl: 'https://picsum.photos/seed/radiance-ferry/900/700',
  },
  {
    id: 'demo-castro',
    name: 'Castro',
    address: '410 Castro Street',
    lat: 37.762,
    lng: -122.435,
    hours: 'Opens 10am',
    neighborhood: 'Castro',
    imageUrl: 'https://picsum.photos/seed/radiance-castro/900/700',
  },
  {
    id: 'demo-hayes',
    name: 'Hayes Valley',
    address: '300 Hayes Street',
    lat: 37.7765,
    lng: -122.424,
    hours: 'Open · closes 8pm',
    neighborhood: 'Hayes Valley',
    imageUrl: 'https://picsum.photos/seed/radiance-hayes/900/700',
  },
  {
    id: 'demo-nopa',
    name: 'Divisadero',
    address: '500 Divisadero Street',
    lat: 37.7749,
    lng: -122.437,
    hours: 'Open · closes 7pm',
    neighborhood: 'NoPa',
    imageUrl: 'https://picsum.photos/seed/radiance-nopa/900/700',
  },
  {
    id: 'demo-sunset',
    name: 'Inner Sunset',
    address: '1300 9th Avenue',
    lat: 37.764,
    lng: -122.466,
    hours: 'Open · closes 6pm',
    neighborhood: 'Sunset',
    imageUrl: 'https://picsum.photos/seed/radiance-sunset/900/700',
  },
];

export function getDemoDocuments(_uid: string): DemoPayload {
  return { collections: { locations: DEMO_LOCATIONS } };
}
