import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/lib/theme';

export type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  style?: ViewStyle;
  /**
   * `display` is a page hero; `section` is an in-page grouping title.
   * Unspecified: display on phone, section on desktop (nav already has the page title).
   */
  size?: 'display' | 'section';
};

/** Display title + muted subtitle used on starter home screens. */
export function SectionHeader({ title, subtitle, trailing, style, size }: SectionHeaderProps) {
  const theme = useTheme();
  const { isDesktop } = useResponsive();
  const compact = size === 'section' || (size == null && isDesktop);

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: compact ? 'center' : 'flex-end',
          justifyContent: 'space-between',
          gap: theme.spacing.md,
          marginBottom: compact ? 0 : theme.spacing.sm,
        },
        style,
      ]}
    >
      <View style={{ flex: 1, gap: theme.spacing.xs }}>
        <Text variant={compact ? 'subtitle' : 'display'}>{title}</Text>
        {subtitle ? (
          <Text variant={compact ? 'caption' : 'body'} tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}
