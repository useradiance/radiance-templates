import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { DEFAULT_REGION, type MapMarker, type MapViewProps } from '@/lib/maps';
import { useTheme } from '@/lib/theme';

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (
          el: HTMLElement,
          opts: object,
        ) => {
          setCenter: (c: { lat: number; lng: number }) => void;
          setZoom: (z: number) => void;
          addListener: (event: string, handler: () => void) => void;
          getCenter: () => { lat: () => number; lng: () => number };
          getZoom: () => number;
        };
        Marker: new (opts: object) => {
          setMap: (map: unknown) => void;
          addListener: (e: string, h: () => void) => void;
        };
        event: { clearInstanceListeners: (target: unknown) => void };
      };
    };
  }
}

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.maps) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>('script[data-radiance-maps]');
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')));
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.dataset.radianceMaps = 'true';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);
  });
}

export function MapView({
  region = DEFAULT_REGION,
  markers = [],
  onRegionChangeComplete,
  onMarkerSelect,
  style,
}: MapViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<InstanceType<NonNullable<typeof window.google>['maps']['Map']> | null>(
    null,
  );
  const markerRefs = useRef<unknown[]>([]);
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';

  useEffect(() => {
    if (!apiKey || !containerRef.current) return;

    let cancelled = false;

    void loadGoogleMaps(apiKey).then(() => {
      if (cancelled || !containerRef.current || !window.google?.maps) return;

      const map = new window.google.maps.Map(containerRef.current, {
        center: { lat: region.latitude, lng: region.longitude },
        zoom: 12,
      });
      mapRef.current = map;

      map.addListener('idle', () => {
        const center = map.getCenter();
        if (!center || !onRegionChangeComplete) return;
        onRegionChangeComplete({
          latitude: center.lat(),
          longitude: center.lng(),
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        });
      });

      syncMarkers(map, markers, onMarkerSelect);
    });

    return () => {
      cancelled = true;
      markerRefs.current = [];
    };
    // Intentionally only bootstrap once; region/markers synced below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setCenter({ lat: region.latitude, lng: region.longitude });
  }, [region.latitude, region.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;
    syncMarkers(map, markers, onMarkerSelect);
  }, [markers, onMarkerSelect]);

  function syncMarkers(
    map: NonNullable<typeof mapRef.current>,
    nextMarkers: MapMarker[],
    onSelect?: (marker: MapMarker) => void,
  ) {
    markerRefs.current.forEach((marker) => {
      window.google?.maps.event.clearInstanceListeners(marker);
      (marker as { setMap: (m: null) => void }).setMap(null);
    });
    markerRefs.current = nextMarkers.map((marker) => {
      const instance = new window.google!.maps.Marker({
        map,
        position: { lat: marker.latitude, lng: marker.longitude },
        title: marker.title,
      });
      instance.addListener('click', () => onSelect?.(marker));
      return instance;
    });
  }

  const shellStyle = [
    {
      flex: 1,
      minHeight: 220,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden' as const,
      backgroundColor: theme.colors.surfaceMuted,
      ...theme.elevation.low,
    },
    style,
  ];

  if (!apiKey) {
    return (
      <View
        style={[
          ...shellStyle,
          {
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.lg,
            gap: theme.spacing.sm,
          },
        ]}
      >
        <Text variant="subtitle" center>
          {t('maps.missingApiKeyTitle')}
        </Text>
        <Text tone="muted" center>
          {t('maps.missingApiKeyDescription')}
        </Text>
      </View>
    );
  }

  return (
    <View style={shellStyle}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 220 }} />
    </View>
  );
}

export default MapView;
