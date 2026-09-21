import { useTranslation } from 'react-i18next';

import { CategoryForm } from '@/components/InventoryForms';
import { ResourceEditor } from '@/components/ResourceEditor';
import { useCollection } from '@/hooks/useCollection';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { DEMO_CATEGORIES } from '@/lib/demo-content';
import { withDemoFallback } from '@/lib/demo-fallback';
import { categoriesQuery, deleteCategory, type Category } from '@/lib/inventory';

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const { isAdmin } = useIsAdmin();
  const { data: live, isLoading } = useCollection<Category>(
    () => categoriesQuery(),
    'categories:all',
  );
  const categories = withDemoFallback(live, DEMO_CATEGORIES);

  return (
    <ResourceEditor
      title={t('warehouse.categories')}
      subtitle={t('warehouse.categoriesSubtitle')}
      data={categories}
      canWrite={isAdmin}
      isLoading={isLoading}
      emptyTitle={t('warehouse.emptyCategories')}
      emptyDescription={t('warehouse.emptyCategoriesHint')}
      createLabel={t('warehouse.new')}
      detailPath={(id) => `/category/${id}`}
      createPath="/category/new"
      columns={[
        {
          id: 'name',
          header: t('warehouse.name'),
          accessor: (row) => row.name,
          sortable: true,
          filterable: true,
          flex: 1.4,
        },
        {
          id: 'description',
          header: t('warehouse.description'),
          accessor: (row) => row.description,
          sortable: true,
          filterable: true,
          flex: 2,
        },
      ]}
      renderDetail={({ record, creating, canWrite, onClose }) => (
        <CategoryForm
          record={record}
          canWrite={canWrite}
          onSaved={creating ? onClose : undefined}
          onDeleted={onClose}
          onClose={onClose}
        />
      )}
      onDelete={(row) => deleteCategory(row.id)}
      deleteTitle={t('warehouse.deleteTitle')}
      deleteHint={t('warehouse.deleteHint')}
      deletedMessage={t('warehouse.deleted')}
      deleteFailedMessage={t('warehouse.deleteFailed')}
    />
  );
}
