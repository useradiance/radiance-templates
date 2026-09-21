import { Ionicons } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View, type ViewStyle } from 'react-native';

import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/lib/theme';

export type SplitViewProps = {
  master: ReactNode;
  detail?: ReactNode;
  placeholder?: ReactNode;
  masterWidth?: number;
  style?: ViewStyle;
  /** Desktop: collapse the detail pane so the list can use the full width. */
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
};

/**
 * Master-detail pane. On desktop, master stays visible beside detail.
 * On phone, only `master` renders — push a stack route for the detail screen.
 */
export function SplitView({
  master,
  detail,
  placeholder,
  masterWidth = 360,
  style,
  collapsible = false,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
}: SplitViewProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isDesktop } = useResponsive();
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? internalCollapsed;
  const showDetail = !collapsible || !collapsed;

  function setCollapsed(next: boolean) {
    if (collapsedProp == null) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  }

  if (!isDesktop) {
    return <View style={[{ flex: 1 }, style]}>{master}</View>;
  }

  return (
    <View style={[{ flex: 1, flexDirection: 'row', minHeight: 0 }, style]}>
      <View
        style={{
          width: showDetail ? masterWidth : undefined,
          flex: showDetail ? undefined : 1,
          minWidth: 0,
          backgroundColor: theme.colors.surface,
        }}
      >
        {master}
      </View>
      {collapsible ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={showDetail ? t('table.collapseDetail') : t('table.expandDetail')}
          onPress={() => setCollapsed(showDetail)}
          style={({ pressed }) => ({
            width: showDetail ? 16 : 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderLeftWidth: 1,
            borderRightWidth: showDetail ? 1 : 0,
            borderLeftColor: theme.colors.border,
            borderRightColor: theme.colors.border,
            backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.background,
          })}
        >
          <Ionicons
            name={showDetail ? 'chevron-forward' : 'chevron-back'}
            size={16}
            color={theme.colors.textMuted}
          />
        </Pressable>
      ) : (
        <View
          style={{
            width: 1,
            backgroundColor: theme.colors.border,
          }}
        />
      )}
      {showDetail ? <View style={{ flex: 1, minWidth: 0 }}>{detail ?? placeholder}</View> : null}
    </View>
  );
}
