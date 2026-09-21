import { View, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';

export type BadgeTone = 'default' | 'primary' | 'success' | 'warning' | 'danger';

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  style?: ViewStyle;
};

/** Compact status / count pill. */
export function Badge({ label, tone = 'default', style }: BadgeProps) {
  const theme = useTheme();

  const background: Record<BadgeTone, string> = {
    default: theme.colors.surfaceMuted,
    primary: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
  };

  const foreground: Record<BadgeTone, string> = {
    default: theme.colors.text,
    primary: theme.colors.primaryText,
    success: theme.colors.textInverted,
    warning: theme.colors.textInverted,
    danger: theme.colors.dangerText,
  };

  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 2,
          borderRadius: theme.radius.pill,
          backgroundColor: background[tone],
        },
        style,
      ]}
    >
      <Text variant="caption" weight="semibold" style={{ color: foreground[tone] }}>
        {label}
      </Text>
    </View>
  );
}
