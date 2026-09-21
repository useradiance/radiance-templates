import type { ReactNode } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';

import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/lib/theme';

export type CatalogLayoutProps = {
  header?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
  style?: ViewStyle;
};

/** Full-pane shop / listing chrome: header, optional chip row, then the grid. */
export function CatalogLayout({ header, filters, children, style }: CatalogLayoutProps) {
  const theme = useTheme();
  const { containerPadding } = useResponsive();

  return (
    <View style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}>
      {header || filters ? (
        <View
          style={{
            paddingHorizontal: containerPadding,
            paddingTop: containerPadding,
            gap: theme.spacing.md,
          }}
        >
          {header}
          {filters}
        </View>
      ) : null}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

export type ChipRowProps = {
  children: ReactNode;
  style?: ViewStyle;
};

/** Horizontal filter chips under a catalog header. */
export function ChipRow({ children, style }: ChipRowProps) {
  const theme = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        { flexDirection: 'row', gap: theme.spacing.sm, paddingBottom: theme.spacing.sm },
        style,
      ]}
    >
      {children}
    </ScrollView>
  );
}
