import CommunitySlider from '@react-native-community/slider';
import { View, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';

export type SliderProps = {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  disabled?: boolean;
  style?: ViewStyle;
};

/** Themed continuous control for filters, volume, and ranges. */
export function Slider({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 1,
  step,
  label,
  showValue = false,
  formatValue,
  disabled,
  style,
}: SliderProps) {
  const theme = useTheme();

  return (
    <View style={[{ gap: theme.spacing.xs, alignSelf: 'stretch' }, style]}>
      {label || showValue ? (
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {label ? (
            <Text variant="label" tone="muted">
              {label}
            </Text>
          ) : (
            <View />
          )}
          {showValue ? (
            <Text variant="label" weight="medium">
              {formatValue ? formatValue(value) : String(value)}
            </Text>
          ) : null}
        </View>
      ) : null}
      <CommunitySlider
        value={value}
        onValueChange={onValueChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        disabled={disabled}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.surfaceMuted}
        thumbTintColor={theme.colors.primary}
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        style={{ width: '100%', height: 40 }}
      />
    </View>
  );
}
