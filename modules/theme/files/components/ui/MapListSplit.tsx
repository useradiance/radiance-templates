import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/lib/theme';

export type MapListSplitProps = {
  list: ReactNode;
  map: ReactNode;
  listWidth?: number;
  style?: ViewStyle;
};

/**
 * Google Maps / Airbnb search: list beside map on desktop, map stacked above list on phone.
 */
export function MapListSplit({ list, map, listWidth = 400, style }: MapListSplitProps) {
  const theme = useTheme();
  const { isDesktop } = useResponsive();

  if (!isDesktop) {
    return (
      <View style={[{ flex: 1 }, style]}>
        <View style={{ height: 240 }}>{map}</View>
        <View style={{ flex: 1, minHeight: 0 }}>{list}</View>
      </View>
    );
  }

  return (
    <View style={[{ flex: 1, flexDirection: 'row', minHeight: 0 }, style]}>
      <View
        style={{
          width: listWidth,
          borderRightWidth: 1,
          borderRightColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        }}
      >
        {list}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>{map}</View>
    </View>
  );
}
