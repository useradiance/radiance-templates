import { useTranslation } from 'react-i18next';

import { WarehouseForm } from '@/components/InventoryForms';
import { ResourceEditor } from '@/components/ResourceEditor';
import { useCollection } from '@/hooks/useCollection';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { DEMO_WAREHOUSES } from '@/lib/demo-content';
import { withDemoFallback } from '@/lib/demo-fallback';
import { deleteWarehouse, warehousesQuery, type Warehouse } from '@/lib/inventory';

export default function LocationsScreen() {
  const { t } = useTranslation();
  const { isAdmin } = useIsAdmin();
  const { data: live, isLoading } = useCollection<Warehouse>(
    () => warehousesQuery(),
    'warehouses:all',
  );
  const warehouses = withDemoFallback(live, DEMO_WAREHOUSES);

  return (
    <ResourceEditor
      title={t('warehouse.locations')}
      subtitle={t('warehouse.locationsSubtitle')}
      data={warehouses}
      canWrite={isAdmin}
      isLoading={isLoading}
      emptyTitle={t('warehouse.emptyWarehouses')}
      emptyDescription={t('warehouse.emptyWarehousesHint')}
      createLabel={t('warehouse.new')}
      detailPath={(id) => `/warehouse/${id}`}
      createPath="/warehouse/new"
      columns={[
        {
          id: 'code',
          header: t('warehouse.code'),
          accessor: (row) => row.code,
          sortable: true,
          filterable: true,
          width: 88,
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
          id: 'city',
          header: t('warehouse.city'),
          accessor: (row) => row.city,
          sortable: true,
          filterable: true,
          flex: 1.2,
        },
      ]}
      renderDetail={({ record, creating, canWrite, onClose }) => (
        <WarehouseForm
          record={record}
          canWrite={canWrite}
          onSaved={creating ? onClose : undefined}
          onDeleted={onClose}
          onClose={onClose}
        />
      )}
      onDelete={(row) => deleteWarehouse(row.id)}
      deleteTitle={t('warehouse.deleteTitle')}
      deleteHint={t('warehouse.deleteHint')}
      deletedMessage={t('warehouse.deleted')}
      deleteFailedMessage={t('warehouse.deleteFailed')}
    />
  );
}
