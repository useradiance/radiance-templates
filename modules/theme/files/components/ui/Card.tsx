import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/lib/theme';

export type CardProps = {
  children: ReactNode;
  padded?: boolean;
  elevated?: boolean;
  style?: ViewStyle;
};

/** Shared surface container — prefer over one-off border + elevation blocks. */
export function Card({ children, padded = true, elevated = true, style }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: padded ? theme.spacing.lg : 0,
          gap: theme.spacing.md,
          ...(elevated ? theme.elevation.low : theme.elevation.none),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
