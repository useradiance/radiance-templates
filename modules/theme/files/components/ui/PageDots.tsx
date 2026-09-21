import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/lib/theme';

export type PageDotsProps = {
  count: number;
  index: number;
  style?: ViewStyle;
};

/** Active/inactive dots for onboarding and pagers. */
export function PageDots({ count, index, style }: PageDotsProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="adjustable"
      accessibilityValue={{ min: 0, max: Math.max(0, count - 1), now: index }}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.sm,
        },
        style,
      ]}
    >
      {Array.from({ length: count }, (_, i) => {
        const active = i === index;
        return (
          <View
            key={i}
            style={{
              width: active ? 18 : 8,
              height: 8,
              borderRadius: theme.radius.pill,
              backgroundColor: active ? theme.colors.primary : theme.colors.borderStrong,
            }}
          />
        );
      })}
    </View>
  );
}
