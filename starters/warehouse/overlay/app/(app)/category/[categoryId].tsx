import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { doc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { CategoryForm } from '@/components/InventoryForms';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { useDocument } from '@/hooks/useDocument';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { DEMO_CATEGORIES } from '@/lib/demo-content';
import { getDb } from '@/lib/firestore';
import { CATEGORIES_COLLECTION, type Category } from '@/lib/inventory';

export default function CategoryDetailScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { isAdmin } = useIsAdmin();
  const creating = categoryId === 'new';
  const { data: live, isLoading } = useDocument<Category>(
    () => doc(getDb(), CATEGORIES_COLLECTION, categoryId),
    creating || !categoryId ? null : `category:${categoryId}`,
  );
  const record = creating
    ? null
    : (live ?? DEMO_CATEGORIES.find((row) => row.id === categoryId) ?? null);

  if (!creating && isLoading && !record) return <StateView kind="loading" />;
  if (!creating && !record) return <StateView kind="empty" />;

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: record?.name ?? t('warehouse.newCategory') }} />
      <Screen scroll width="form">
        <CategoryForm
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
