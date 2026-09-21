import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { SCREEN_MAX_WIDTH } from '@/components/ui/Screen';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/lib/theme';

export type FeedLayoutProps = {
  children: ReactNode;
  rail?: ReactNode;
  style?: ViewStyle;
};

/**
 * Instagram / X style: centered feed column plus an optional right rail on desktop.
 * The rail fills leftover pane space so the feed is not a lonely 720px strip.
 */
export function FeedLayout({ children, rail, style }: FeedLayoutProps) {
  const theme = useTheme();
  const { isDesktop, containerPadding } = useResponsive();

  if (!isDesktop) {
    return <View style={[{ flex: 1 }, style]}>{children}</View>;
  }

  return (
    <View
      style={[
        {
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: theme.spacing.xl,
          paddingHorizontal: containerPadding,
        },
        style,
      ]}
    >
      <View style={{ width: '100%', maxWidth: SCREEN_MAX_WIDTH.feed, minWidth: 0 }}>
        {children}
      </View>
      {rail ? (
        <View style={{ width: 320, paddingTop: theme.spacing.lg, gap: theme.spacing.lg }}>
          {rail}
        </View>
      ) : null}
    </View>
  );
}
