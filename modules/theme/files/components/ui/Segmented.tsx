import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';

export type SegmentedOption = {
  value: string;
  label: string;
};

export type SegmentedProps = {
  value: string;
  options: SegmentedOption[];
  onChange: (value: string) => void;
};

/** In-screen tab control (not Expo Router tabs). */
export function Segmented({ value, options, onChange }: SegmentedProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        padding: theme.spacing.xs,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.surfaceMuted,
        gap: theme.spacing.xs,
      }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={{
              flex: 1,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.radius.md,
              backgroundColor: active ? theme.colors.surface : 'transparent',
              alignItems: 'center',
              ...(active ? theme.elevation.low : theme.elevation.none),
            }}
          >
            <Text variant="label" weight={active ? 'semibold' : 'medium'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
