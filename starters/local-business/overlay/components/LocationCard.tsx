import { Pressable } from 'react-native';

import { Card } from '@/components/ui/Card';
import { MediaImage } from '@/components/ui/MediaImage';
import { Text } from '@/components/ui/Text';
import type { Location } from '@/lib/locations';

export function LocationCard({ location, onPress }: { location: Location; onPress?: () => void }) {
  const body = (
    <Card>
      {location.imageUrl ? (
        <MediaImage
          uri={location.imageUrl}
          aspectRatio={16 / 9}
          accessibilityLabel={location.name}
        />
      ) : null}
      <Text variant="subtitle">{location.name}</Text>
      <Text variant="caption" tone="muted">
        {location.neighborhood ? `${location.neighborhood} · ` : ''}
        {location.address}
      </Text>
      {location.hours ? (
        <Text variant="caption" tone="muted">
          {location.hours}
        </Text>
      ) : null}
    </Card>
  );

  if (!onPress) return body;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      {body}
    </Pressable>
  );
}
