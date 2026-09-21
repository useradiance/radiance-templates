import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';
import { useSyncStore } from '@/stores/sync';

/** Banner that appears while the app is serving cached data or flushing writes. */
export function SyncBanner() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isOffline = useSyncStore((state) => state.isOffline);
  const hasPendingWrites = useSyncStore((state) => state.hasPendingWrites);

  if (!isOffline && !hasPendingWrites) return null;

  const icon = isOffline ? 'cloud-offline-outline' : 'sync-outline';
  const iconColor = isOffline ? theme.colors.warning : theme.colors.primary;
  const backgroundColor = isOffline ? theme.colors.surfaceMuted : theme.colors.secondary;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
        backgroundColor,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <Ionicons name={icon} size={16} color={iconColor} />
      <Text variant="caption" weight="medium">
        {isOffline ? t('common.offline') : t('sync.pendingWrites')}
      </Text>
    </View>
  );
}
