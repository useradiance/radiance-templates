import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import { logger } from '@/lib/logger';

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export type MapMarker = {
  id: string;
  title?: string;
  description?: string;
  latitude: number;
  longitude: number;
};

export type MapViewProps = {
  region?: MapRegion;
  markers?: MapMarker[];
  showsUserLocation?: boolean;
  onRegionChangeComplete?: (region: MapRegion) => void;
  onMarkerSelect?: (marker: MapMarker) => void;
  style?: object;
};

export const DEFAULT_REGION: MapRegion = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export function regionFromCoords(latitude: number, longitude: number, delta = 0.05): MapRegion {
  return {
    latitude,
    longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
}

export function markersById(markers: MapMarker[]): Record<string, MapMarker> {
  return Object.fromEntries(markers.map((marker) => [marker.id, marker]));
}

/** Requests foreground location permission, centers on the user, and watches for updates. */
export function useUserLocation(initial: MapRegion = DEFAULT_REGION) {
  const [region, setRegion] = useState<MapRegion>(initial);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('maps.permissionDenied');
        return null;
      }
      const position = await Location.getCurrentPositionAsync({});
      const next = regionFromCoords(position.coords.latitude, position.coords.longitude);
      setRegion(next);

      if (!watchRef.current) {
        watchRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 25,
          },
          (update) => {
            setRegion(regionFromCoords(update.coords.latitude, update.coords.longitude));
            setError(null);
          },
        );
      }

      return next;
    } catch (err) {
      logger.warn('location failed', err);
      setError('maps.locationError');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void requestPermission();
    return () => {
      watchRef.current?.remove();
      watchRef.current = null;
    };
  }, [requestPermission]);

  return { region, setRegion, error, isLoading, requestPermission };
}
