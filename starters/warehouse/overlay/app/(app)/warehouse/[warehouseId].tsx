import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { doc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { WarehouseForm } from '@/components/InventoryForms';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { useDocument } from '@/hooks/useDocument';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { DEMO_WAREHOUSES } from '@/lib/demo-content';
import { getDb } from '@/lib/firestore';
import { WAREHOUSES_COLLECTION, type Warehouse } from '@/lib/inventory';

export default function WarehouseDetailScreen() {
  const { warehouseId } = useLocalSearchParams<{ warehouseId: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { isAdmin } = useIsAdmin();
  const creating = warehouseId === 'new';
  const { data: live, isLoading } = useDocument<Warehouse>(
    () => doc(getDb(), WAREHOUSES_COLLECTION, warehouseId),
    creating || !warehouseId ? null : `warehouse:${warehouseId}`,
  );
  const record = creating
    ? null
    : (live ?? DEMO_WAREHOUSES.find((row) => row.id === warehouseId) ?? null);

  if (!creating && isLoading && !record) return <StateView kind="loading" />;
  if (!creating && !record) return <StateView kind="empty" />;

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: record?.name ?? t('warehouse.newWarehouse') }} />
      <Screen scroll width="form">
        <WarehouseForm
          record={record}
          canWrite={isAdmin}
          onSaved={() => router.back()}
          onDeleted={() => router.back()}
          onClose={() => router.back()}
        />
      </Screen>
    </View>
  );
}
