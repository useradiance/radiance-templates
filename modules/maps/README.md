# maps module

Cross-platform map view (`react-native-maps` on native, Google Maps JS on web) plus location permission helpers.

Install with:

```bash
radiance add maps
```

**Requires:** `i18n`, `theme`

## What it does

- Shared `MapView` props across web and native.
- `useUserLocation` requests permission, centers on the user, and watches updates.
- Wires Google Maps API keys into `app.config` iOS/Android config + `expo-location` plugin.

## What it adds

| Path                         | Purpose                                             |
| ---------------------------- | --------------------------------------------------- |
| `components/MapView.tsx`     | Native map                                          |
| `components/MapView.web.tsx` | Web Google Maps                                     |
| `lib/maps.ts`                | Types, `DEFAULT_REGION`, `useUserLocation`, helpers |

## API

```tsx
import { MapView } from '@/components/MapView';
import { useUserLocation, regionFromCoords } from '@/lib/maps';

const { region, error, isLoading, requestPermission } = useUserLocation();

<MapView
  region={region}
  markers={[{ id: '1', title: 'HQ', latitude: 37.77, longitude: -122.42 }]}
  showsUserLocation
/>;
```

Types: `MapRegion`, `MapMarker`, `MapViewProps`.

## Configuration

| Env                               | Required | Purpose                    |
| --------------------------------- | -------- | -------------------------- |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | yes      | Maps JS + native tiles     |
| `EXPO_PUBLIC_GOOGLE_MAPS_MAP_ID`  | no       | Advanced markers / styling |

Enable **Maps JavaScript API** (and related Maps SDKs) on the Google Cloud key.

Native keys are spliced into `app.config.ts`:

```ts
ios: { config: { googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY } },
android: { config: { googleMaps: { apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY } } },
```

## Notes

- Full Google Maps on device needs a **development build** (Expo Go is limited on Android).
- For Places search / geofences, add the `places` module (same API key; enable Places API).
- Not included in starters by default except location-heavy ones (`local-business`, `marketplace`).
