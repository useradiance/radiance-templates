import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/lib/theme';

export type MediaDetailProps = {
  media: ReactNode;
  children: ReactNode;
  style?: ViewStyle;
};

/**
 * Apple Store / Airbnb listing: media on the left, sticky buy/book pane on the right (desktop).
 * Stacks on phone.
 */
export function MediaDetail({ media, children, style }: MediaDetailProps) {
  const theme = useTheme();
  const { isDesktop, containerPadding } = useResponsive();

  if (!isDesktop) {
    return (
      <View style={[{ gap: theme.spacing.lg, padding: containerPadding }, style]}>
        {media}
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: theme.spacing.xxl,
          padding: containerPadding,
        },
        style,
      ]}
    >
      <View style={{ flex: 1.2, minWidth: 0 }}>{media}</View>
      <View style={{ flex: 0.8, minWidth: 280, maxWidth: 440, gap: theme.spacing.lg }}>
        {children}
      </View>
    </View>
  );
}
