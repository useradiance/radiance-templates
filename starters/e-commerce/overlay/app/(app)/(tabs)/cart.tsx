import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { CartLineRow } from '@/components/CartLineRow';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { List } from '@/components/ui/List';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { useResponsive } from '@/hooks/useResponsive';
import { formatMinorUnits } from '@/lib/format';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';
import { cartTotal, useCartStore } from '@/stores/cart';

export default function CartScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { isDesktop, containerPadding } = useResponsive();
  const uid = useAuthStore((state) => state.user?.uid ?? null);

  const lines = useCartStore((state) => state.lines);
  const setQuantity = useCartStore((state) => state.setQuantity);

  const currency = lines[0]?.currency ?? 'USD';
  const total = cartTotal(lines);

  const summary =
    lines.length > 0 ? (
      <Card>
        <View style={{ gap: theme.spacing.md }}>
          <Text variant="subtitle">{t('cart.total')}</Text>
          <Text variant="title">{formatMinorUnits(total, currency)}</Text>
          <Button
            title={t('cart.checkout')}
            fullWidth
            disabled={!uid}
            onPress={() => router.push('/(app)/checkout')}
          />
        </View>
      </Card>
    ) : null;

  const list = (
    <List
      data={lines}
      keyExtractor={(line) => line.lineKey}
      gap="md"
      width="full"
      contentContainerStyle={{ padding: containerPadding }}
      ListHeaderComponent={<SectionHeader title={t('cart.title')} subtitle={t('cart.subtitle')} />}
      ListEmptyComponent={
        <StateView
          kind="empty"
          title={t('cart.emptyTitle')}
          description={t('cart.emptyDescription')}
        />
      }
      renderItem={({ item }) => (
        <CartLineRow
          line={item}
          increaseLabel={t('cart.increase')}
          decreaseLabel={t('cart.decrease')}
          onDecrease={() => setQuantity(item.lineKey, item.quantity - 1)}
          onIncrease={() => setQuantity(item.lineKey, item.quantity + 1)}
        />
      )}
      ListFooterComponent={!isDesktop ? summary : null}
    />
  );

  if (isDesktop) {
    return (
      <Screen padded={false} width="full">
        <View style={{ flex: 1, flexDirection: 'row', minHeight: 0 }}>
          <View style={{ flex: 1, minWidth: 0 }}>{list}</View>
          <View
            style={{
              width: 360,
              padding: theme.spacing.lg,
              borderLeftWidth: 1,
              borderLeftColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            }}
          >
            {summary ?? <StateView kind="empty" title={t('cart.emptyTitle')} />}
          </View>
        </View>
      </Screen>
    );
  }

  return <View style={{ flex: 1, backgroundColor: theme.colors.background }}>{list}</View>;
}
