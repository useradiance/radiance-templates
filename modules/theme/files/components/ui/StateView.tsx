import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';

export type StateViewProps = {
  kind: 'loading' | 'empty' | 'error';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ComponentProps<typeof Ionicons>['name'];
  /**
   * Underlying failure. In `__DEV__`, used as the description fallback so you see the real
   * message (e.g. Firestore `permission-denied`) instead of the generic network copy.
   * Data hooks log the same error to the console.
   */
  cause?: unknown;
};

/** Consistent loading / empty / error placeholder so screens never render a blank void. */
export function StateView({
  kind,
  title,
  description,
  actionLabel,
  onAction,
  icon,
  cause,
}: StateViewProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  if (kind === 'loading') {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.md,
          padding: theme.spacing.xl,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.surfaceMuted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator color={theme.colors.primary} />
        </View>
        <Text variant="label" tone="muted">
          {title ?? t('common.loading')}
        </Text>
      </View>
    );
  }

  const fallbackTitle = kind === 'error' ? t('errors.generic') : t('states.emptyTitle');
  const fallbackDescription = kind === 'error' ? t('errors.network') : t('states.emptyDescription');
  const iconName = icon ?? (kind === 'error' ? 'alert-circle-outline' : 'file-tray-outline');
  const iconColor = kind === 'error' ? theme.colors.danger : theme.colors.textMuted;
  const detail =
    description ??
    (__DEV__ && kind === 'error' && cause instanceof Error ? cause.message : undefined) ??
    fallbackDescription;

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.xxl,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing.xs,
        }}
      >
        <Ionicons name={iconName} size={32} color={iconColor} />
      </View>
      <Text variant="subtitle" center>
        {title ?? fallbackTitle}
      </Text>
      <Text
        variant="body"
        tone="muted"
        center
        style={{ maxWidth: 320, lineHeight: theme.typography.lineHeight.md }}
      >
        {detail}
      </Text>
      {onAction ? (
        <Button
          title={actionLabel ?? t('common.retry')}
          variant={kind === 'error' ? 'secondary' : 'primary'}
          onPress={onAction}
          style={{ marginTop: theme.spacing.sm, alignSelf: 'center' }}
        />
      ) : null}
    </View>
  );
}
