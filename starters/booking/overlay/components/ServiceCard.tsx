import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { MediaImage } from '@/components/ui/MediaImage';
import { Text } from '@/components/ui/Text';
import type { Service } from '@/lib/booking';
import { useTheme } from '@/lib/theme';

export function ServiceCard({ service, onPress }: { service: Service; onPress: () => void }) {
  const theme = useTheme();
  const price = `$${(service.priceInMinorUnits / 100).toFixed(0)}`;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.88 : 1 })}
    >
      <Card padded={false} style={{ overflow: 'hidden', gap: 0 }}>
        {service.imageUrl ? (
          <MediaImage uri={service.imageUrl} aspectRatio={4 / 3} radius="none" />
        ) : null}
        <View style={{ padding: theme.spacing.md, gap: theme.spacing.xs }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.sm }}
          >
            <Text variant="subtitle" numberOfLines={1} style={{ flex: 1 }}>
              {service.name}
            </Text>
            <Badge label={price} tone="primary" />
          </View>
          <Text variant="caption" tone="muted">
            {service.durationMinutes} min
            {service.rating ? ` · ${service.rating.toFixed(1)}` : ''}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
