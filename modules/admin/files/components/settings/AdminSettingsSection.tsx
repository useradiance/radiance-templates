import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';

/** Settings entry that opens the gated `/admin` console. */
export function AdminSettingsSection() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text variant="label" tone="muted">
        {t('admin.title')}
      </Text>
      <Link href="/admin" asChild>
        <Pressable
          accessibilityRole="link"
          style={({ pressed }) => ({
            paddingVertical: theme.spacing.lg,
            paddingHorizontal: theme.spacing.lg,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            opacity: pressed ? 0.88 : 1,
            ...theme.elevation.low,
          })}
        >
          <Text variant="body" weight="semibold">
            {t('admin.openConsole')}
          </Text>
          <Text variant="caption" tone="muted">
            {t('admin.openConsoleHint')}
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
