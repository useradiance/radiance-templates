import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { List } from '@/components/ui/List';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { useCollection } from '@/hooks/useCollection';
import { formatMinorUnits } from '@/lib/format';
import { ordersQuery, type Order } from '@/lib/catalog';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

export default function OrdersScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const uid = useAuthStore((state) => state.user?.uid ?? null);
  const { data, isLoading } = useCollection<Order>(
    () => ordersQuery(uid!),
    uid ? `orders:${uid}` : null,
  );

  return (
    <Screen padded={false}>
      <List
        data={data}
        keyExtractor={(order) => order.id}
        gap="md"
        contentContainerStyle={{ padding: theme.spacing.lg }}
        ListHeaderComponent={
          <SectionHeader title={t('orders.title')} subtitle={t('orders.subtitle')} />
        }
        ListEmptyComponent={
          isLoading ? (
            <StateView kind="loading" />
          ) : (
            <StateView
              kind="empty"
              title={t('orders.emptyTitle')}
              description={t('orders.emptyDescription')}
            />
          )
        }
        renderItem={({ item }) => (
          <View
            style={{
              padding: theme.spacing.lg,
              borderRadius: theme.radius.xl,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              gap: theme.spacing.xs,
            }}
          >
            <Text variant="subtitle">
              {formatMinorUnits(item.totalInMinorUnits, item.currency)}
            </Text>
            <Text variant="caption" tone="muted">
              {t('orders.status', { status: item.status })}
            </Text>
            <Text variant="caption" tone="muted">
              {item.lines.map((line) => `${line.quantity}× ${line.name}`).join(', ')}
            </Text>
          </View>
        )}
      />
    </Screen>
  );
}
