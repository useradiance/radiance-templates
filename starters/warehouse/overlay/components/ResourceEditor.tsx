import { useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { SyncBanner } from '@/components/SyncBanner';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import {
  DataTable,
  type DataTableColumn,
  type DataTableFilterDef,
} from '@/components/ui/DataTable';
import { Dialog } from '@/components/ui/Dialog';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { SplitView } from '@/components/ui/SplitView';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/lib/theme';

export type ResourceEditorProps<T extends { id: string }> = {
  title: string;
  subtitle?: string;
  data: T[];
  columns: DataTableColumn<T>[];
  canWrite: boolean;
  isLoading?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  createLabel: string;
  detailPath: (id: string) => string;
  createPath: string;
  headerExtra?: ReactNode;
  filters?: ReactNode;
  tableFilters?: DataTableFilterDef<T>[] | false;
  defaultFilterValues?: Record<string, string>;
  onFilterValuesChange?: (values: Record<string, string>) => void;
  renderDetail: (args: {
    record: T | null;
    creating: boolean;
    canWrite: boolean;
    onClose: () => void;
  }) => ReactNode;
  onDelete?: (record: T) => Promise<void>;
  deleteTitle: string;
  deleteHint: string;
  deletedMessage: string;
  deleteFailedMessage: string;
};

export function ResourceEditor<T extends { id: string }>({
  title,
  subtitle,
  data,
  columns,
  canWrite,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  createLabel,
  detailPath,
  createPath,
  headerExtra,
  filters,
  tableFilters,
  defaultFilterValues,
  onFilterValuesChange,
  renderDetail,
  onDelete,
  deleteTitle,
  deleteHint,
  deletedMessage,
  deleteFailedMessage,
}: ResourceEditorProps<T>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { isDesktop, containerPadding } = useResponsive();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, setPending] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);
  const [detailCollapsed, setDetailCollapsed] = useState(false);

  const selected = data.find((row) => row.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId && !data.some((row) => row.id === selectedId)) {
      setSelectedId(null);
    }
  }, [data, selectedId]);

  function closeDetail() {
    setCreating(false);
    setSelectedId(null);
  }

  function openDetail() {
    setDetailCollapsed(false);
  }

  function onCreate() {
    if (isDesktop) {
      setCreating(true);
      setSelectedId(null);
      openDetail();
      return;
    }
    router.push(createPath);
  }

  function onRowPress(row: T) {
    if (isDesktop) {
      setCreating(false);
      setSelectedId(row.id);
      openDetail();
      return;
    }
    router.push(detailPath(row.id));
  }

  const header = (
    <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
      <AppHeader
        title={title}
        subtitle={subtitle}
        trailing={
          canWrite ? <Button title={createLabel} size="sm" onPress={onCreate} /> : undefined
        }
      />
      {canWrite ? null : (
        <Text variant="caption" tone="muted">
          {t('warehouse.viewerHint')}
        </Text>
      )}
      {headerExtra}
      {filters}
    </View>
  );

  const master = (
    <View style={{ flex: 1, paddingHorizontal: containerPadding }}>
      <DataTable
        data={data}
        columns={columns}
        keyExtractor={(row) => row.id}
        selectedId={creating ? null : selectedId}
        onRowPress={onRowPress}
        isLoading={isLoading}
        filters={tableFilters}
        defaultFilterValues={defaultFilterValues}
        onFilterValuesChange={onFilterValuesChange}
        ListHeaderComponent={<View style={{ paddingTop: containerPadding }}>{header}</View>}
        contentContainerStyle={{
          paddingBottom: containerPadding,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          isLoading ? undefined : (
            <StateView kind="empty" title={emptyTitle} description={emptyDescription} />
          )
        }
        actions={
          canWrite && onDelete
            ? (row) => (
                <IconButton
                  name="trash-outline"
                  size="sm"
                  accessibilityLabel={t('warehouse.delete')}
                  color={theme.colors.danger}
                  onPress={() => setPending(row)}
                />
              )
            : undefined
        }
      />
    </View>
  );

  const detail =
    creating || selected ? (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: containerPadding, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {renderDetail({
          record: creating ? null : selected,
          creating,
          canWrite,
          onClose: closeDetail,
        })}
      </ScrollView>
    ) : (
      <StateView kind="empty" title={t('warehouse.selectRow')} />
    );

  return (
    <Screen padded={false} width="full">
      <SyncBanner />
      <SplitView
        master={master}
        detail={detail}
        masterWidth={560}
        collapsible
        collapsed={detailCollapsed}
        onCollapsedChange={setDetailCollapsed}
      />
      <Dialog
        visible={pending != null}
        title={deleteTitle}
        description={deleteHint}
        onClose={() => (busy ? undefined : setPending(null))}
        actions={[
          {
            title: t('warehouse.cancel'),
            variant: 'ghost',
            onPress: () => setPending(null),
          },
          {
            title: t('warehouse.delete'),
            variant: 'danger',
            onPress: () => {
              if (!pending || !onDelete) return;
              setBusy(true);
              void onDelete(pending)
                .then(() => {
                  if (selectedId === pending.id) closeDetail();
                  toast(deletedMessage, 'success');
                })
                .catch(() => toast(deleteFailedMessage, 'danger'))
                .finally(() => {
                  setBusy(false);
                  setPending(null);
                });
            },
          },
        ]}
      />
    </Screen>
  );
}
