export type PlaceResult = {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
};

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key || !query.trim()) return [];
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.set('query', query.trim());
  url.searchParams.set('key', key);
  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const body = (await res.json()) as {
    results?: {
      place_id: string;
      name: string;
      formatted_address?: string;
      geometry: { location: { lat: number; lng: number } };
    }[];
  };
  return (body.results ?? []).map((r) => ({
    id: r.place_id,
    name: r.name,
    address: r.formatted_address,
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
  }));
}

export type Geofence = { id: string; lat: number; lng: number; radiusMeters: number };

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function isInsideGeofence(point: { lat: number; lng: number }, fence: Geofence): boolean {
  return haversineMeters(point, fence) <= fence.radiusMeters;
}

export function geofenceTransitions(
  point: { lat: number; lng: number },
  fences: Geofence[],
  previouslyInside: Set<string>,
): { entered: string[]; exited: string[]; inside: Set<string> } {
  const inside = new Set<string>();
  const entered: string[] = [];
  const exited: string[] = [];
  for (const fence of fences) {
    if (isInsideGeofence(point, fence)) {
      inside.add(fence.id);
      if (!previouslyInside.has(fence.id)) entered.push(fence.id);
    } else if (previouslyInside.has(fence.id)) {
      exited.push(fence.id);
    }
  }
  return { entered, exited, inside };
}
