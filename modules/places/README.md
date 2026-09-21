# places module

Google Places text search + circular geofence helpers on top of the `maps` module.

Install with:

```bash
radiance add places
```

**Requires:** `maps`, `i18n`, `theme`

## What it does

- Calls Places Text Search API with `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`.
- Haversine distance + enter/exit detection for circular geofences.

## What it adds

| Path            | Purpose                                                          |
| --------------- | ---------------------------------------------------------------- |
| `lib/places.ts` | `searchPlaces`, `isInsideGeofence`, `geofenceTransitions`, types |

## Usage

```ts
const results = await searchPlaces('coffee near me');
// { id, name, address?, lat, lng }[]

const { entered, exited, inside } = geofenceTransitions({ lat, lng }, fences, previouslyInside);
```

Combine with `useUserLocation` from `maps` for live geofencing.

## Setup checklist

1. Enable **Places API** (and Maps) on the Google Cloud key used by `maps`.
2. Restrict the key by app / HTTP referrer before production.
3. Text Search from the client exposes the key — for high-volume apps, proxy via a callable.

## Notes

- Geofencing here is **foreground JS** — not iOS/Android significant-location / region monitoring APIs.
