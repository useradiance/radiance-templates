import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { MediaImage } from '@/components/ui/MediaImage';
import { Text } from '@/components/ui/Text';
import type { Listing } from '@/lib/listings';
import { useTheme } from '@/lib/theme';

export function ListingCard({ listing, onPress }: { listing: Listing; onPress: () => void }) {
  const theme = useTheme();
  const price = `${(listing.priceInMinorUnits / 100).toFixed(2)} ${listing.currency.toUpperCase()}`;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      <Card padded={false} style={{ overflow: 'hidden', gap: 0 }}>
        <MediaImage uri={listing.imageUrl} aspectRatio={16 / 10} radius="none" />
        <View style={{ padding: theme.spacing.md, gap: theme.spacing.xs }}>
          <Text variant="subtitle" numberOfLines={1}>
            {listing.title}
          </Text>
          <Text variant="body" tone="primary" weight="semibold">
            {price}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
