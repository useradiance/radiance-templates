import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { z } from 'zod';

import { FormField } from '@/components/forms/FormField';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ListRow } from '@/components/ui/ListRow';
import { Select } from '@/components/ui/Select';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useAppForm } from '@/lib/forms';
import { useCollection } from '@/hooks/useCollection';
import { DEMO_CATEGORIES, DEMO_ITEMS, DEMO_STOCK, DEMO_WAREHOUSES } from '@/lib/demo-content';
import { withDemoFallback } from '@/lib/demo-fallback';
import {
  createCategory,
  createItem,
  createWarehouse,
  deleteCategory,
  deleteItem,
  deleteStock,
  deleteWarehouse,
  isLowStock,
  lookupName,
  stockByItemQuery,
  stockByWarehouseQuery,
  updateCategory,
  updateItem,
  updateStock,
  updateWarehouse,
  upsertStock,
  warehousesQuery,
  itemsQuery,
  categoriesQuery,
  type Category,
  type Item,
  type Stock,
  type Warehouse,
} from '@/lib/inventory';
import { useTheme } from '@/lib/theme';

type FormShell = {
  canWrite: boolean;
  onSaved?: (id: string) => void;
  onDeleted?: () => void;
  onClose?: () => void;
};

function ReadField({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <Text variant="body">{value || '—'}</Text>
    </View>
  );
}

function FormActions({
  canWrite,
  creating,
  busy,
  onSave,
  onDelete,
  onClose,
}: {
  canWrite: boolean;
  creating: boolean;
  busy: boolean;
  onSave: () => void;
  onDelete?: () => void;
  onClose?: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  if (!canWrite) {
    return onClose ? (
      <Button title={t('warehouse.close')} variant="secondary" onPress={onClose} />
    ) : null;
  }
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
      <Button
        title={creating ? t('warehouse.create') : t('warehouse.save')}
        loading={busy}
        onPress={onSave}
      />
      {creating || !onDelete ? null : (
        <Button title={t('warehouse.delete')} variant="danger" onPress={onDelete} />
      )}
      {onClose ? <Button title={t('warehouse.cancel')} variant="ghost" onPress={onClose} /> : null}
    </View>
  );
}

const categorySchema = z.object({
  name: z.string().min(1, 'forms.required'),
  description: z.string(),
});

export function CategoryForm({
  record,
  canWrite,
  onSaved,
  onDeleted,
  onClose,
}: FormShell & { record: Category | null }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const creating = record == null;
  const form = useAppForm({
    schema: categorySchema,
    defaultValues: { name: record?.name ?? '', description: record?.description ?? '' },
  });

  useEffect(() => {
    form.reset({ name: record?.name ?? '', description: record?.description ?? '' });
  }, [record?.id]);

  if (!canWrite && record) {
    return (
      <View style={{ gap: theme.spacing.lg }}>
        <Text variant="title">{record.name}</Text>
        <ReadField label={t('warehouse.description')} value={record.description} />
        <FormActions
          canWrite={false}
          creating={false}
          busy={false}
          onSave={() => undefined}
          onClose={onClose}
        />
      </View>
    );
  }

  const save = form.handleSubmit(async (values) => {
    try {
      const id = creating
        ? await createCategory(values)
        : await updateCategory(record.id, values).then(() => record.id);
      toast(t('warehouse.saved'), 'success');
      onSaved?.(id);
    } catch {
      toast(t('warehouse.saveFailed'), 'danger');
    }
  });

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <Text variant="title">{creating ? t('warehouse.newCategory') : record.name}</Text>
      <FormField control={form.control} name="name" label={t('warehouse.name')} />
      <FormField control={form.control} name="description" label={t('warehouse.description')} />
      <FormActions
        canWrite={canWrite}
        creating={creating}
        busy={form.formState.isSubmitting}
        onSave={() => void save()}
        onDelete={
          creating
            ? undefined
            : () =>
                void deleteCategory(record.id)
                  .then(() => {
                    toast(t('warehouse.deleted'), 'success');
                    onDeleted?.();
                  })
                  .catch(() => toast(t('warehouse.deleteFailed'), 'danger'))
        }
        onClose={onClose}
      />
    </View>
  );
}

const warehouseSchema = z.object({
  name: z.string().min(1, 'forms.required'),
  code: z.string().min(1, 'forms.required'),
  city: z.string().min(1, 'forms.required'),
});

export function WarehouseForm({
  record,
  canWrite,
  onSaved,
  onDeleted,
  onClose,
}: FormShell & { record: Warehouse | null }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const creating = record == null;
  const form = useAppForm({
    schema: warehouseSchema,
    defaultValues: { name: record?.name ?? '', code: record?.code ?? '', city: record?.city ?? '' },
  });

  const { data: liveStock } = useCollection<Stock>(
    () => stockByWarehouseQuery(record?.id ?? ''),
    record ? `stock:wh:${record.id}` : null,
  );
  const { data: liveItems } = useCollection<Item>(() => itemsQuery(), 'items:all');
  const stock = withDemoFallback(
    liveStock,
    record ? DEMO_STOCK.filter((row) => row.warehouseId === record.id) : [],
  );
  const items = withDemoFallback(liveItems, DEMO_ITEMS);

  useEffect(() => {
    form.reset({ name: record?.name ?? '', code: record?.code ?? '', city: record?.city ?? '' });
  }, [record?.id]);

  const nested = record ? (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="subtitle">{t('warehouse.stockHere')}</Text>
      {stock.map((row) => (
        <ListRow
          key={row.id}
          title={lookupName(items, row.itemId)}
          subtitle={`${t('warehouse.quantity')} ${row.quantity}`}
          trailing={
            isLowStock(row) ? (
              <Badge label={t('warehouse.reorder')} tone="warning" />
            ) : (
              <Badge label={t('warehouse.inStock')} tone="success" />
            )
          }
          onPress={() => router.push(`/stock/${row.id}`)}
        />
      ))}
      {canWrite ? (
        <Button
          title={t('warehouse.addStock')}
          size="sm"
          variant="secondary"
          onPress={() => router.push(`/stock/new?warehouseId=${record.id}`)}
        />
      ) : null}
    </View>
  ) : null;

  if (!canWrite && record) {
    return (
      <View style={{ gap: theme.spacing.lg }}>
        <Text variant="title">{record.name}</Text>
        <ReadField label={t('warehouse.code')} value={record.code} />
        <ReadField label={t('warehouse.city')} value={record.city} />
        {nested}
        <FormActions
          canWrite={false}
          creating={false}
          busy={false}
          onSave={() => undefined}
          onClose={onClose}
        />
      </View>
    );
  }

  const save = form.handleSubmit(async (values) => {
    try {
      const id = creating
        ? await createWarehouse(values)
        : await updateWarehouse(record.id, values).then(() => record.id);
      toast(t('warehouse.saved'), 'success');
      onSaved?.(id);
    } catch {
      toast(t('warehouse.saveFailed'), 'danger');
    }
  });

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <Text variant="title">{creating ? t('warehouse.newWarehouse') : record.name}</Text>
      <FormField control={form.control} name="name" label={t('warehouse.name')} />
      <FormField
        control={form.control}
        name="code"
        label={t('warehouse.code')}
        autoCapitalize="characters"
      />
      <FormField control={form.control} name="city" label={t('warehouse.city')} />
      {nested}
      <FormActions
        canWrite={canWrite}
        creating={creating}
        busy={form.formState.isSubmitting}
        onSave={() => void save()}
        onDelete={
          creating
            ? undefined
            : () =>
                void deleteWarehouse(record.id)
                  .then(() => {
                    toast(t('warehouse.deleted'), 'success');
                    onDeleted?.();
                  })
                  .catch(() => toast(t('warehouse.deleteFailed'), 'danger'))
        }
        onClose={onClose}
      />
    </View>
  );
}

const itemSchema = z.object({
  sku: z.string().min(1, 'forms.required'),
  name: z.string().min(1, 'forms.required'),
  categoryId: z.string().min(1, 'forms.required'),
  barcode: z.string(),
  unit: z.string().min(1, 'forms.required'),
});

export function ItemForm({
  record,
  canWrite,
  onSaved,
  onDeleted,
  onClose,
}: FormShell & { record: Item | null }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const creating = record == null;
  const form = useAppForm({
    schema: itemSchema,
    defaultValues: {
      sku: record?.sku ?? '',
      name: record?.name ?? '',
      categoryId: record?.categoryId ?? '',
      barcode: record?.barcode ?? '',
      unit: record?.unit ?? 'each',
    },
  });

  const { data: liveCategories } = useCollection<Category>(
    () => categoriesQuery(),
    'categories:all',
  );
  const { data: liveWarehouses } = useCollection<Warehouse>(
    () => warehousesQuery(),
    'warehouses:all',
  );
  const { data: liveStock } = useCollection<Stock>(
    () => stockByItemQuery(record?.id ?? ''),
    record ? `stock:item:${record.id}` : null,
  );
  const categories = withDemoFallback(liveCategories, DEMO_CATEGORIES);
  const warehouses = withDemoFallback(liveWarehouses, DEMO_WAREHOUSES);
  const stock = withDemoFallback(
    liveStock,
    record ? DEMO_STOCK.filter((row) => row.itemId === record.id) : [],
  );

  useEffect(() => {
    form.reset({
      sku: record?.sku ?? '',
      name: record?.name ?? '',
      categoryId: record?.categoryId ?? '',
      barcode: record?.barcode ?? '',
      unit: record?.unit ?? 'each',
    });
  }, [record?.id]);

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const nested = record ? (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="subtitle">{t('warehouse.stockByLocation')}</Text>
      {stock.map((row) => (
        <ListRow
          key={row.id}
          title={lookupName(warehouses, row.warehouseId)}
          subtitle={`${t('warehouse.quantity')} ${row.quantity}`}
          trailing={
            isLowStock(row) ? (
              <Badge label={t('warehouse.reorder')} tone="warning" />
            ) : (
              <Badge label={t('warehouse.inStock')} tone="success" />
            )
          }
          onPress={() => router.push(`/stock/${row.id}`)}
        />
      ))}
      {canWrite ? (
        <Button
          title={t('warehouse.addStock')}
          size="sm"
          variant="secondary"
          onPress={() => router.push(`/stock/new?itemId=${record.id}`)}
        />
      ) : null}
    </View>
  ) : null;

  if (!canWrite && record) {
    return (
      <View style={{ gap: theme.spacing.lg }}>
        <Text variant="title">{record.name}</Text>
        <ReadField label={t('warehouse.sku')} value={record.sku} />
        <ReadField
          label={t('warehouse.category')}
          value={lookupName(categories, record.categoryId)}
        />
        <ReadField label={t('warehouse.barcode')} value={record.barcode} />
        <ReadField label={t('warehouse.unit')} value={record.unit} />
        {nested}
        <FormActions
          canWrite={false}
          creating={false}
          busy={false}
          onSave={() => undefined}
          onClose={onClose}
        />
      </View>
    );
  }

  const save = form.handleSubmit(async (values) => {
    try {
      const id = creating
        ? await createItem(values)
        : await updateItem(record.id, values).then(() => record.id);
      toast(t('warehouse.saved'), 'success');
      onSaved?.(id);
    } catch {
      toast(t('warehouse.saveFailed'), 'danger');
    }
  });

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <Text variant="title">{creating ? t('warehouse.newItem') : record.name}</Text>
      <FormField
        control={form.control}
        name="sku"
        label={t('warehouse.sku')}
        autoCapitalize="characters"
      />
      <FormField control={form.control} name="name" label={t('warehouse.name')} />
      <Controller
        control={form.control}
        name="categoryId"
        render={({ field, fieldState }) => (
          <View style={{ gap: theme.spacing.xs }}>
            <Select
              label={t('warehouse.category')}
              value={field.value || null}
              options={categoryOptions}
              placeholder={t('warehouse.pickCategory')}
              onChange={field.onChange}
            />
            {fieldState.error?.message ? (
              <Text variant="caption" tone="danger">
                {t(fieldState.error.message)}
              </Text>
            ) : null}
          </View>
        )}
      />
      <FormField
        control={form.control}
        name="barcode"
        label={t('warehouse.barcode')}
        keyboardType="number-pad"
      />
      <FormField control={form.control} name="unit" label={t('warehouse.unit')} />
      {nested}
      <FormActions
        canWrite={canWrite}
        creating={creating}
        busy={form.formState.isSubmitting}
        onSave={() => void save()}
        onDelete={
          creating
            ? undefined
            : () =>
                void deleteItem(record.id)
                  .then(() => {
                    toast(t('warehouse.deleted'), 'success');
                    onDeleted?.();
                  })
                  .catch(() => toast(t('warehouse.deleteFailed'), 'danger'))
        }
        onClose={onClose}
      />
    </View>
  );
}

const stockSchema = z.object({
  itemId: z.string().min(1, 'forms.required'),
  warehouseId: z.string().min(1, 'forms.required'),
  quantity: z.string().min(1, 'forms.required'),
  reorderLevel: z.string().min(1, 'forms.required'),
});

export function StockForm({
  record,
  canWrite,
  defaultItemId,
  defaultWarehouseId,
  onSaved,
  onDeleted,
  onClose,
}: FormShell & {
  record: Stock | null;
  defaultItemId?: string;
  defaultWarehouseId?: string;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const creating = record == null;
  const form = useAppForm({
    schema: stockSchema,
    defaultValues: {
      itemId: record?.itemId ?? defaultItemId ?? '',
      warehouseId: record?.warehouseId ?? defaultWarehouseId ?? '',
      quantity: record ? String(record.quantity) : '0',
      reorderLevel: record ? String(record.reorderLevel) : '0',
    },
  });

  const { data: liveItems } = useCollection<Item>(() => itemsQuery(), 'items:all');
  const { data: liveWarehouses } = useCollection<Warehouse>(
    () => warehousesQuery(),
    'warehouses:all',
  );
  const items = withDemoFallback(liveItems, DEMO_ITEMS);
  const warehouses = withDemoFallback(liveWarehouses, DEMO_WAREHOUSES);

  useEffect(() => {
    form.reset({
      itemId: record?.itemId ?? defaultItemId ?? '',
      warehouseId: record?.warehouseId ?? defaultWarehouseId ?? '',
      quantity: record ? String(record.quantity) : '0',
      reorderLevel: record ? String(record.reorderLevel) : '0',
    });
  }, [record?.id, defaultItemId, defaultWarehouseId]);

  const itemName = lookupName(items, record?.itemId ?? form.watch('itemId'));
  const warehouseName = lookupName(warehouses, record?.warehouseId ?? form.watch('warehouseId'));

  if (!canWrite && record) {
    return (
      <View style={{ gap: theme.spacing.lg }}>
        <Text variant="title">{itemName}</Text>
        <ReadField label={t('warehouse.item')} value={itemName} />
        <ReadField label={t('warehouse.warehouse')} value={warehouseName} />
        <ReadField label={t('warehouse.quantity')} value={String(record.quantity)} />
        <ReadField label={t('warehouse.reorderLevel')} value={String(record.reorderLevel)} />
        {isLowStock(record) ? <Badge label={t('warehouse.reorder')} tone="warning" /> : null}
        <FormActions
          canWrite={false}
          creating={false}
          busy={false}
          onSave={() => undefined}
          onClose={onClose}
        />
      </View>
    );
  }

  const save = form.handleSubmit(async (values) => {
    const quantity = Number.parseInt(values.quantity, 10);
    const reorderLevel = Number.parseInt(values.reorderLevel, 10);
    if (Number.isNaN(quantity) || Number.isNaN(reorderLevel)) {
      toast(t('warehouse.saveFailed'), 'danger');
      return;
    }
    try {
      const id = creating
        ? await upsertStock({
            itemId: values.itemId,
            warehouseId: values.warehouseId,
            quantity,
            reorderLevel,
          })
        : await updateStock(record.id, { quantity, reorderLevel }).then(() => record.id);
      toast(t('warehouse.saved'), 'success');
      onSaved?.(id);
    } catch {
      toast(t('warehouse.saveFailed'), 'danger');
    }
  });

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <Text variant="title">{creating ? t('warehouse.newStock') : itemName}</Text>
      {creating ? (
        <>
          <Controller
            control={form.control}
            name="itemId"
            render={({ field, fieldState }) => (
              <View style={{ gap: theme.spacing.xs }}>
                <Select
                  label={t('warehouse.item')}
                  value={field.value || null}
                  options={items.map((entry) => ({
                    value: entry.id,
                    label: `${entry.sku} · ${entry.name}`,
                  }))}
                  placeholder={t('warehouse.pickItem')}
                  onChange={field.onChange}
                />
                {fieldState.error?.message ? (
                  <Text variant="caption" tone="danger">
                    {t(fieldState.error.message)}
                  </Text>
                ) : null}
              </View>
            )}
          />
          <Controller
            control={form.control}
            name="warehouseId"
            render={({ field, fieldState }) => (
              <View style={{ gap: theme.spacing.xs }}>
                <Select
                  label={t('warehouse.warehouse')}
                  value={field.value || null}
                  options={warehouses.map((entry) => ({
                    value: entry.id,
                    label: `${entry.code} · ${entry.name}`,
                  }))}
                  placeholder={t('warehouse.pickWarehouse')}
                  onChange={field.onChange}
                />
                {fieldState.error?.message ? (
                  <Text variant="caption" tone="danger">
                    {t(fieldState.error.message)}
                  </Text>
                ) : null}
              </View>
            )}
          />
        </>
      ) : (
        <>
          <ReadField label={t('warehouse.item')} value={itemName} />
          <ReadField label={t('warehouse.warehouse')} value={warehouseName} />
        </>
      )}
      <FormField
        control={form.control}
        name="quantity"
        label={t('warehouse.quantity')}
        keyboardType="number-pad"
      />
      <FormField
        control={form.control}
        name="reorderLevel"
        label={t('warehouse.reorderLevel')}
        keyboardType="number-pad"
      />
      <FormActions
        canWrite={canWrite}
        creating={creating}
        busy={form.formState.isSubmitting}
        onSave={() => void save()}
        onDelete={
          creating
            ? undefined
            : () =>
                void deleteStock(record.id)
                  .then(() => {
                    toast(t('warehouse.deleted'), 'success');
                    onDeleted?.();
                  })
                  .catch(() => toast(t('warehouse.deleteFailed'), 'danger'))
        }
        onClose={onClose}
      />
    </View>
  );
}
