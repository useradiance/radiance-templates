import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { doc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { StockForm } from '@/components/InventoryForms';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { useDocument } from '@/hooks/useDocument';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { DEMO_STOCK } from '@/lib/demo-content';
import { getDb } from '@/lib/firestore';
import { STOCK_COLLECTION, type Stock } from '@/lib/inventory';

export default function StockDetailScreen() {
  const { stockId, itemId, warehouseId } = useLocalSearchParams<{
    stockId: string;
    itemId?: string;
    warehouseId?: string;
  }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { isAdmin } = useIsAdmin();
  const creating = stockId === 'new';
  const { data: live, isLoading } = useDocument<Stock>(
    () => doc(getDb(), STOCK_COLLECTION, stockId),
    creating || !stockId ? null : `stock:${stockId}`,
  );
  const record = creating ? null : (live ?? DEMO_STOCK.find((row) => row.id === stockId) ?? null);
  const defaultItemId = Array.isArray(itemId) ? itemId[0] : itemId;
  const defaultWarehouseId = Array.isArray(warehouseId) ? warehouseId[0] : warehouseId;

  if (!creating && isLoading && !record) return <StateView kind="loading" />;
  if (!creating && !record) return <StateView kind="empty" />;

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: t('warehouse.newStock') }} />
      <Screen scroll width="form">
        <StockForm
          record={record}
          canWrite={isAdmin}
          defaultItemId={defaultItemId}
          defaultWarehouseId={defaultWarehouseId}
          onSaved={() => router.back()}
          onDeleted={() => router.back()}
          onClose={() => router.back()}
        />
      </Screen>
    </View>
  );
}
