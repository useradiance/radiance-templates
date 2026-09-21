import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StockForm } from '@/components/InventoryForms';
import { ResourceEditor } from '@/components/ResourceEditor';
import { Badge } from '@/components/ui/Badge';
import { useCollection } from '@/hooks/useCollection';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { DEMO_ITEMS, DEMO_STOCK, DEMO_WAREHOUSES } from '@/lib/demo-content';
import { withDemoFallback } from '@/lib/demo-fallback';
import {
  deleteStock,
  isLowStock,
  itemsQuery,
  lookupName,
  stockQuery,
  warehousesQuery,
  type Item,
  type Stock,
  type Warehouse,
} from '@/lib/inventory';

export default function StockScreen() {
  const { t } = useTranslation();
  const { isAdmin } = useIsAdmin();
  const [warehouseId, setWarehouseId] = useState('all');

  const { data: liveStock, isLoading } = useCollection<Stock>(() => stockQuery(), 'stock:all');
  const { data: liveItems } = useCollection<Item>(() => itemsQuery(), 'items:all');
  const { data: liveWarehouses } = useCollection<Warehouse>(
    () => warehousesQuery(),
    'warehouses:all',
  );

  const items = withDemoFallback(liveItems, DEMO_ITEMS);
  const warehouses = withDemoFallback(liveWarehouses, DEMO_WAREHOUSES);
  const stock = useMemo(() => withDemoFallback(liveStock, DEMO_STOCK), [liveStock]);

  return (
    <ResourceEditor
      title={t('warehouse.stock')}
      subtitle={t('warehouse.stockSubtitle')}
      data={stock}
      canWrite={isAdmin}
      isLoading={isLoading}
      emptyTitle={t('warehouse.emptyStock')}
      emptyDescription={t('warehouse.emptyStockHint')}
      createLabel={t('warehouse.new')}
      detailPath={(id) => `/stock/${id}`}
      createPath="/stock/new"
      defaultFilterValues={{ warehouseId: 'all' }}
      onFilterValuesChange={(values) => setWarehouseId(values.warehouseId ?? 'all')}
      tableFilters={[
        {
          source: 'warehouseId',
          alwaysOn: true,
          label: t('warehouse.warehouse'),
          choices: [
            { id: 'all', name: t('warehouse.allLocations') },
            ...warehouses.map((warehouse) => ({ id: warehouse.id, name: warehouse.code })),
          ],
          match: (row, value) => value === 'all' || row.warehouseId === value,
        },
      ]}
      columns={[
        {
          id: 'sku',
          header: t('warehouse.sku'),
          accessor: (row) => items.find((item) => item.id === row.itemId)?.sku ?? '—',
          sortable: true,
          filterable: true,
          flex: 1,
        },
        {
          id: 'item',
          header: t('warehouse.item'),
          accessor: (row) => lookupName(items, row.itemId),
          sortable: true,
          filterable: true,
          flex: 2,
        },
        {
          id: 'warehouse',
          header: t('warehouse.warehouse'),
          accessor: (row) => lookupName(warehouses, row.warehouseId),
          sortable: true,
          flex: 1.4,
        },
        {
          id: 'qty',
          header: t('warehouse.quantity'),
          accessor: (row) => row.quantity,
          sortable: true,
          align: 'right',
          width: 72,
        },
        {
          id: 'status',
          header: t('warehouse.status'),
          width: 108,
          render: (row) =>
            isLowStock(row) ? (
              <Badge label={t('warehouse.reorder')} tone="warning" />
            ) : (
              <Badge label={t('warehouse.inStock')} tone="success" />
            ),
        },
      ]}
      renderDetail={({ record, creating, canWrite, onClose }) => (
        <StockForm
          record={record}
          canWrite={canWrite}
          defaultWarehouseId={warehouseId === 'all' ? undefined : warehouseId}
          onSaved={creating ? onClose : undefined}
          onDeleted={onClose}
          onClose={onClose}
        />
      )}
      onDelete={(row) => deleteStock(row.id)}
      deleteTitle={t('warehouse.deleteTitle')}
      deleteHint={t('warehouse.deleteHint')}
      deletedMessage={t('warehouse.deleted')}
      deleteFailedMessage={t('warehouse.deleteFailed')}
    />
  );
}
