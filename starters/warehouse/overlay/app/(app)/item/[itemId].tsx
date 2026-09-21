import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { doc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ItemForm } from '@/components/InventoryForms';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { useDocument } from '@/hooks/useDocument';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { DEMO_ITEMS } from '@/lib/demo-content';
import { getDb } from '@/lib/firestore';
import { ITEMS_COLLECTION, type Item } from '@/lib/inventory';

export default function ItemDetailScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { isAdmin } = useIsAdmin();
  const creating = itemId === 'new';
  const { data: live, isLoading } = useDocument<Item>(
    () => doc(getDb(), ITEMS_COLLECTION, itemId),
    creating || !itemId ? null : `item:${itemId}`,
  );
  const record = creating ? null : (live ?? DEMO_ITEMS.find((row) => row.id === itemId) ?? null);

  if (!creating && isLoading && !record) return <StateView kind="loading" />;
  if (!creating && !record) return <StateView kind="empty" />;

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: record?.name ?? t('warehouse.newItem') }} />
      <Screen scroll width="form">
        <ItemForm
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
