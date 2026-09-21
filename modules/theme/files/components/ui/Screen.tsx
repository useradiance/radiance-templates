import type { ReactNode } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/lib/theme';
import type { Breakpoint } from '@/lib/theme/tokens';

export type ScreenWidth = 'phone' | 'form' | 'feed' | 'content' | 'wide' | 'full';
export type ScreenAlign = 'start' | 'center';

export type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: { top?: boolean; bottom?: boolean };
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  /**
   * Constrains content on larger viewports.
   * Defaults to `full` (fill the pane after app chrome). Use `feed` / `reader` /
   * `form` with FeedLayout, ReaderLayout, or auth screens.
   */
  width?: ScreenWidth;
  /**
   * Horizontal placement of the constrained column on desktop.
   * App chrome defaults to `start` (left of the main pane). Pass `center` for
   * standalone auth / marketing forms with no sidebar.
   */
  align?: ScreenAlign;
};

export const SCREEN_MAX_WIDTH: Record<Exclude<ScreenWidth, 'full'>, number> = {
  phone: 480,
  form: 440,
  feed: 720,
  content: 720,
  wide: 1100,
};

export function screenConstrainStyle(
  width: ScreenWidth,
  breakpoint: Breakpoint,
  align: ScreenAlign = 'start',
): ViewStyle | undefined {
  if (width === 'full') return undefined;
  if (breakpoint === 'xs' || breakpoint === 'sm') return { width: '100%' };
  return {
    width: '100%',
    maxWidth: SCREEN_MAX_WIDTH[width],
    alignSelf: align === 'center' ? 'center' : 'flex-start',
  };
}

/** Shared max-width + alignment for Screen, List, and Grid on desktop. */
export function useScreenConstrain(
  width: ScreenWidth = 'full',
  align: ScreenAlign = 'start',
): ViewStyle | undefined {
  const { breakpoint } = useResponsive();
  return screenConstrainStyle(width, breakpoint, align);
}

/** Screen-level container: safe areas, background colour and responsive gutters. */
export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = { top: true, bottom: true },
  style,
  contentContainerStyle,
  width = 'full',
  align = 'start',
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { containerPadding, breakpoint } = useResponsive();

  const container: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: edges.top ? insets.top : 0,
    paddingBottom: edges.bottom ? insets.bottom : 0,
  };

  const constrain = screenConstrainStyle(width, breakpoint, align);

  const content: ViewStyle = {
    padding: padded ? containerPadding : 0,
    gap: theme.spacing.xl,
    ...(constrain ?? {}),
  };

  if (scroll) {
    return (
      <ScrollView
        style={[container, style]}
        contentContainerStyle={[content, { flexGrow: 1 }, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[container, content, style]}>{children}</View>;
}
