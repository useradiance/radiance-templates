import { View, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';

export type ProgressProps = {
  /** Progress from 0..1 */
  value: number;
  label?: string;
  showPercent?: boolean;
  style?: ViewStyle;
};

/** Linear progress bar for uploads and multi-step flows. */
export function Progress({ value, label, showPercent = false, style }: ProgressProps) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <View style={[{ gap: theme.spacing.xs, alignSelf: 'stretch' }, style]}>
      {label || showPercent ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {label ? (
            <Text variant="caption" tone="muted">
              {label}
            </Text>
          ) : (
            <View />
          )}
          {showPercent ? (
            <Text variant="caption" tone="muted">
              {Math.round(clamped * 100)}%
            </Text>
          ) : null}
        </View>
      ) : null}
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
        style={{
          height: 8,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.surfaceMuted,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${clamped * 100}%`,
            height: '100%',
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.primary,
          }}
        />
      </View>
    </View>
  );
}
