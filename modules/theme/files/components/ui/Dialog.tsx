import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';

export type DialogAction = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export type DialogProps = {
  visible: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  onClose: () => void;
  actions?: DialogAction[];
};

/**
 * Centered modal for confirmations and short forms.
 * Backdrop and card are siblings (not nested Pressables) so web does not
 * nest interactive elements and crash.
 */
export function Dialog({ visible, title, description, children, onClose, actions }: DialogProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          padding: theme.spacing.xl,
          backgroundColor: theme.colors.overlay,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close dialog"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.xl,
            padding: theme.spacing.xl,
            gap: theme.spacing.md,
            maxWidth: 440,
            width: '100%',
            alignSelf: 'center',
            zIndex: 1,
            ...theme.elevation.medium,
          }}
        >
          <Text variant="title">{title}</Text>
          {description ? (
            <Text variant="body" tone="muted">
              {description}
            </Text>
          ) : null}
          {children}
          {actions?.length ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
                gap: theme.spacing.sm,
                marginTop: theme.spacing.sm,
              }}
            >
              {actions.map((action) => (
                <Button
                  key={action.title}
                  title={action.title}
                  variant={action.variant ?? 'primary'}
                  onPress={action.onPress}
                />
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
