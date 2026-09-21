import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/lib/theme';

const READER_MAX = 680;

export type ReaderLayoutProps = {
  children: ReactNode;
  rail?: ReactNode;
  style?: ViewStyle;
};

/** Medium-style centered prose column with an optional bookmark/actions rail. */
export function ReaderLayout({ children, rail, style }: ReaderLayoutProps) {
  const theme = useTheme();
  const { isDesktop, containerPadding } = useResponsive();

  return (
    <View
      style={[
        {
          flex: 1,
          flexDirection: isDesktop && rail ? 'row' : 'column',
          justifyContent: 'center',
          gap: theme.spacing.xl,
          padding: containerPadding,
        },
        style,
      ]}
    >
      <View style={{ width: '100%', maxWidth: READER_MAX, alignSelf: 'center' }}>{children}</View>
      {isDesktop && rail ? (
        <View style={{ width: 72, paddingTop: theme.spacing.xxl }}>{rail}</View>
      ) : (
        rail
      )}
    </View>
  );
}
