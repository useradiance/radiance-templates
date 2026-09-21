import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/lib/theme';

export type SettingsLayoutProps = {
  children: ReactNode;
  aside?: ReactNode;
};

/**
 * Settings body: one column on phone, two on desktop.
 * Do not use `flex: 1` on the stacked phone columns — inside a ScrollView that
 * overlaps Appearance with the aside (Admin).
 */
export function SettingsLayout({ children, aside }: SettingsLayoutProps) {
  const theme = useTheme();
  const { isDesktop } = useResponsive();

  return (
    <View
      style={{
        flexDirection: isDesktop ? 'row' : 'column',
        alignItems: 'stretch',
        gap: theme.spacing.xl,
        width: '100%',
      }}
    >
      <View
        style={{
          width: '100%',
          gap: theme.spacing.lg,
          ...(isDesktop ? { flex: 1, minWidth: 0 } : { flexGrow: 0, flexShrink: 0 }),
        }}
      >
        {children}
      </View>
      {aside ? (
        <View
          style={{
            width: '100%',
            gap: theme.spacing.lg,
            ...(isDesktop
              ? { flex: 1, minWidth: 0, maxWidth: 420 }
              : { flexGrow: 0, flexShrink: 0 }),
          }}
        >
          {aside}
        </View>
      ) : null}
    </View>
  );
}
