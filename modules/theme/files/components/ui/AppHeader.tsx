import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/lib/theme';

export type AppHeaderProps = {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  style?: ViewStyle;
};

/** Page title row with optional actions — use instead of a stacked create-form hero. */
export function AppHeader({ title, subtitle, trailing, style }: AppHeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: subtitle ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.md,
        },
        style,
      ]}
    >
      <View style={{ flex: 1, gap: theme.spacing.xs }}>
        <Text variant="title">{title}</Text>
        {subtitle ? (
          <Text variant="body" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}
