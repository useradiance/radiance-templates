import { StyleSheet, View } from 'react-native';
import RNMapView, { Marker } from 'react-native-maps';

import { DEFAULT_REGION, type MapViewProps } from '@/lib/maps';
import { useTheme } from '@/lib/theme';

export function MapView({
  region = DEFAULT_REGION,
  markers = [],
  showsUserLocation = false,
  onRegionChangeComplete,
  onMarkerSelect,
  style,
}: MapViewProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          minHeight: 220,
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: 'hidden',
          backgroundColor: theme.colors.surfaceMuted,
          ...theme.elevation.low,
        },
        style,
      ]}
    >
      <RNMapView
        style={StyleSheet.absoluteFill}
        region={region}
        showsUserLocation={showsUserLocation}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.title}
            description={marker.description}
            onPress={() => onMarkerSelect?.(marker)}
          />
        ))}
      </RNMapView>
    </View>
  );
}

export default MapView;
