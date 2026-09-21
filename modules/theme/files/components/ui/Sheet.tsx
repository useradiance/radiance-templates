import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/lib/theme';

export type SheetAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SheetProps = {
  visible: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  /** Desktop: place the menu under this control. Phone always uses a bottom sheet. */
  anchor?: SheetAnchor | null;
};

const MENU_WIDTH = 280;

function DesktopMenu({ visible, title, children, onClose, anchor }: SheetProps) {
  const theme = useTheme();
  const { width, height } = useResponsive();
  const menuWidth = Math.min(MENU_WIDTH, width - theme.spacing.xl);
  let left = anchor ? anchor.x : (width - menuWidth) / 2;
  let top = anchor ? anchor.y + anchor.height + theme.spacing.xs : height * 0.18;
  if (left + menuWidth > width - theme.spacing.md) {
    left = Math.max(theme.spacing.md, width - menuWidth - theme.spacing.md);
  }
  if (left < theme.spacing.md) left = theme.spacing.md;
  const estimatedHeight = 280;
  if (top + estimatedHeight > height - theme.spacing.md && anchor) {
    top = Math.max(theme.spacing.md, anchor.y - estimatedHeight);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={{
            position: 'absolute',
            top,
            left,
            width: menuWidth,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: theme.spacing.md,
            gap: theme.spacing.xs,
            zIndex: 1,
            ...theme.elevation.medium,
          }}
        >
          {title ? (
            <Text variant="label" tone="muted">
              {title}
            </Text>
          ) : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}

function MobileSheet({ visible, title, children, onClose }: SheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close sheet"
          onPress={onClose}
          style={{ flex: 1, backgroundColor: theme.colors.overlay }}
        />
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.radius.xl,
            borderTopRightRadius: theme.radius.xl,
            padding: theme.spacing.xl,
            paddingBottom: Math.max(insets.bottom, theme.spacing.xl),
            gap: theme.spacing.md,
            ...theme.elevation.medium,
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 36,
              height: 4,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.colors.borderStrong,
              marginBottom: theme.spacing.xs,
            }}
          />
          {title ? <Text variant="title">{title}</Text> : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}

/**
 * Picker surface: bottom sheet on phone, anchored popup menu on desktop.
 */
export function Sheet({ visible, title, children, onClose, anchor }: SheetProps) {
  const { isDesktop } = useResponsive();
  if (isDesktop) {
    return (
      <DesktopMenu visible={visible} title={title} onClose={onClose} anchor={anchor}>
        {children}
      </DesktopMenu>
    );
  }
  return (
    <MobileSheet visible={visible} title={title} onClose={onClose}>
      {children}
    </MobileSheet>
  );
}
