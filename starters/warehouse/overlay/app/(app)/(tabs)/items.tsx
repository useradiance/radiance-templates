import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ItemForm } from '@/components/InventoryForms';
import { ResourceEditor } from '@/components/ResourceEditor';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useCollection } from '@/hooks/useCollection';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { DEMO_CATEGORIES, DEMO_ITEMS } from '@/lib/demo-content';
import { withDemoFallback } from '@/lib/demo-fallback';
import {
  categoriesQuery,
  deleteItem,
  itemsQuery,
  lookupName,
  type Category,
  type Item,
} from '@/lib/inventory';
import { prefixQuery } from '@/lib/search';

export default function ItemsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAdmin } = useIsAdmin();
  const { scanned } = useLocalSearchParams<{ scanned?: string | string[] }>();
  const [term, setTerm] = useState('');
  const trimmed = term.trim();

  const { data: live, isLoading } = useCollection<Item>(
    () => (trimmed ? prefixQuery('items', 'nameLower', trimmed)! : itemsQuery()),
    trimmed ? `items:name:${trimmed.toLowerCase()}` : 'items:all',
  );
  const { data: bySku } = useCollection<Item>(
    () => prefixQuery('items', 'skuLower', trimmed)!,
    trimmed ? `items:sku:${trimmed.toLowerCase()}` : null,
  );
  const { data: liveCategories } = useCollection<Category>(
    () => categoriesQuery(),
    'categories:all',
  );

  const categories = withDemoFallback(liveCategories, DEMO_CATEGORIES);
  const items = useMemo(() => {
    const merged = new Map<string, Item>();
    for (const row of withDemoFallback(live, DEMO_ITEMS)) merged.set(row.id, row);
    for (const row of bySku) merged.set(row.id, row);
    return [...merged.values()];
  }, [live, bySku]);

  const scanValue = Array.isArray(scanned) ? scanned[0] : scanned;

  useEffect(() => {
    if (!scanValue) return;
    const match = items.find((row) => row.barcode === scanValue);
    if (match) {
      toast(t('warehouse.scanHit', { name: match.name }), 'success');
      router.replace(`/item/${match.id}`);
      return;
    }
    if (!isLoading) {
      toast(t('warehouse.scanMiss'), 'danger');
      router.replace('/items');
    }
  }, [scanValue, items, isLoading, router, t]);

  return (
    <ResourceEditor
      title={t('warehouse.items')}
      subtitle={t('warehouse.itemsSubtitle')}
      data={items}
      canWrite={isAdmin}
      isLoading={isLoading}
      emptyTitle={t('warehouse.emptyItems')}
      emptyDescription={t('warehouse.emptyItemsHint')}
      createLabel={t('warehouse.new')}
      detailPath={(id) => `/item/${id}`}
      createPath="/item/new"
      tableFilters={[{ source: 'q', alwaysOn: true, placeholder: t('warehouse.searchItems') }]}
      onFilterValuesChange={(values) => setTerm(values.q ?? '')}
      headerExtra={
        <Button
          title={t('warehouse.scan')}
          size="sm"
          variant="secondary"
          onPress={() => router.push('/scan')}
        />
      }
      columns={[
        {
          id: 'sku',
          header: t('warehouse.sku'),
          accessor: (row) => row.sku,
          sortable: true,
          filterable: true,
          flex: 1,
        },
        {
          id: 'name',
          header: t('warehouse.name'),
          accessor: (row) => row.name,
          sortable: true,
          filterable: true,
          flex: 2,
        },
        {
          id: 'category',
          header: t('warehouse.category'),
          accessor: (row) => lookupName(categories, row.categoryId),
          sortable: true,
          filterable: true,
          flex: 1.2,
        },
        {
          id: 'barcode',
          header: t('warehouse.barcode'),
          accessor: (row) => row.barcode,
          sortable: true,
          filterable: true,
          flex: 1.2,
        },
        { id: 'unit', header: t('warehouse.unit'), accessor: (row) => row.unit, width: 80 },
      ]}
      renderDetail={({ record, creating, canWrite, onClose }) => (
        <ItemForm
          record={record}
          canWrite={canWrite}
          onSaved={creating ? onClose : undefined}
          onDeleted={onClose}
          onClose={onClose}
        />
      )}
      onDelete={(row) => deleteItem(row.id)}
      deleteTitle={t('warehouse.deleteTitle')}
      deleteHint={t('warehouse.deleteHint')}
      deletedMessage={t('warehouse.deleted')}
      deleteFailedMessage={t('warehouse.deleteFailed')}
    />
  );
}
