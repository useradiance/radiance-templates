import { Pressable, type PressableProps, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';

export type FabProps = Omit<PressableProps, 'style' | 'children'> & {
  label?: string;
  accessibilityLabel: string;
  style?: ViewStyle;
};

/** Floating primary action. Position it yourself (typically bottom-end). */
export function Fab({ label, accessibilityLabel, style, disabled, ...rest }: FabProps) {
  const theme = useTheme();
  const size = 56;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      style={({ pressed }) => [
        {
          minWidth: size,
          height: size,
          paddingHorizontal: label ? theme.spacing.lg : 0,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
          ...theme.elevation.medium,
        },
        style,
      ]}
      {...rest}
    >
      {label ? (
        <Text variant="label" weight="semibold" style={{ color: theme.colors.primaryText }}>
          {label}
        </Text>
      ) : (
        <Text variant="title" style={{ color: theme.colors.primaryText }}>
          +
        </Text>
      )}
    </Pressable>
  );
}
