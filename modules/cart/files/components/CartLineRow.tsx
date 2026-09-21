import { View } from 'react-native';

import { IconButton } from '@/components/ui/IconButton';
import { MediaImage } from '@/components/ui/MediaImage';
import { Text } from '@/components/ui/Text';
import { formatMinorUnits } from '@/lib/format';
import { useTheme } from '@/lib/theme';
import type { CartLine as CartLineType } from '@/stores/cart';

export function CartLineRow({
  line,
  onIncrease,
  onDecrease,
  increaseLabel,
  decreaseLabel,
}: {
  line: CartLineType;
  onIncrease: () => void;
  onDecrease: () => void;
  increaseLabel: string;
  decreaseLabel: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.md,
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
      }}
    >
      <View style={{ width: 64 }}>
        <MediaImage uri={line.imageUrl} aspectRatio={1} radius="md" />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body" weight="medium">
          {line.name}
        </Text>
        {line.variantLabel ? (
          <Text variant="caption" tone="muted">
            {line.variantLabel}
          </Text>
        ) : null}
        <Text variant="caption" tone="muted">
          {line.quantity} × {formatMinorUnits(line.priceInMinorUnits, line.currency)}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <IconButton
          name="remove"
          size="sm"
          accessibilityLabel={decreaseLabel}
          onPress={onDecrease}
        />
        <IconButton name="add" size="sm" accessibilityLabel={increaseLabel} onPress={onIncrease} />
      </View>
    </View>
  );
}
