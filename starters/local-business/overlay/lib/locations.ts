import { collection, orderBy, query } from 'firebase/firestore';
import { getDb } from '@/lib/firestore';

export type Location = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  hours?: string;
  neighborhood?: string;
  imageUrl?: string | null;
};

export function locationsQuery() {
  return query(collection(getDb(), 'locations'), orderBy('name', 'asc'));
}
