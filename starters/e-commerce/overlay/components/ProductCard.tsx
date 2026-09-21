import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { MediaImage } from '@/components/ui/MediaImage';
import { Text } from '@/components/ui/Text';
import type { Product } from '@/lib/catalog';
import { formatMinorUnits } from '@/lib/format';
import { useTheme } from '@/lib/theme';

export type ProductCardProps = {
  product: Product;
  onPress: () => void;
};

export function ProductCard({ product, onPress }: ProductCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        opacity: pressed ? 0.88 : 1,
        transform: pressed ? [{ scale: 0.98 }] : undefined,
      })}
    >
      <Card padded={false} style={{ gap: 0, overflow: 'hidden' }}>
        <MediaImage uri={product.imageUrl} aspectRatio={1} radius="none" />
        <View style={{ gap: theme.spacing.xs, padding: theme.spacing.md }}>
          <Text variant="label" weight="semibold" numberOfLines={2}>
            {product.name}
          </Text>
          <Text variant="body" tone="primary" weight="semibold">
            {formatMinorUnits(product.priceInMinorUnits, product.currency)}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
