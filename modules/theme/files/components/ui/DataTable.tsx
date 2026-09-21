import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState, type ReactElement, type ReactNode } from 'react';
import {
  PanResponder,
  Platform,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { DataTableFilters } from '@/components/ui/DataTableFilters';
import { List } from '@/components/ui/List';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useResponsive } from '@/hooks/useResponsive';
import {
  applyTableFilters,
  resolveTableFilters,
  type DataTableFilterDef,
} from '@/lib/table-filter';
import { sortTableRows, type SortDirection, type SortableColumn } from '@/lib/table-sort';
import { useTheme } from '@/lib/theme';

export type { DataTableFilterChoice, DataTableFilterDef } from '@/lib/table-filter';

export type DataTableColumn<T> = SortableColumn<T> & {
  id: string;
  header: string;
  flex?: number;
  width?: number;
  sortable?: boolean;
  /** Adds an optional FilterForm field (react-admin `<TextInput source>`). */
  filterable?: boolean;
  align?: 'left' | 'right';
  render?: (row: T) => ReactNode;
};

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (row: T) => string;
  onRowPress?: (row: T) => void;
  selectedId?: string | null;
  actions?: (row: T) => ReactNode;
  isLoading?: boolean;
  ListHeaderComponent?: ReactElement | null;
  ListEmptyComponent?: ReactElement | null;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * FilterForm defs. Omit for always-on freeform `q` plus `filterable` columns.
   * Pass `false` to hide filters.
   */
  filters?: DataTableFilterDef<T>[] | false;
  filterValues?: Record<string, string>;
  defaultFilterValues?: Record<string, string>;
  onFilterValuesChange?: (values: Record<string, string>) => void;
  /** Default desktop row height. Users can drag a row's bottom edge to resize. */
  rowHeight?: number;
};

function cellText<T>(column: DataTableColumn<T>, row: T): string {
  if (column.render) return '';
  const value = column.accessor?.(row);
  if (value == null || value === '') return '—';
  return String(value);
}

function columnBoxStyle<T>(column: DataTableColumn<T>, widths: Record<string, number>): ViewStyle {
  const width = widths[column.id] ?? column.width;
  if (width) {
    return { flexGrow: 0, flexShrink: 0, width, minWidth: width, maxWidth: width };
  }
  return { flexGrow: column.flex ?? 1, flexShrink: 1, flexBasis: 0, minWidth: 72 };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function ResizeHandle({
  axis,
  value,
  onChange,
  onBegin,
  min,
  max,
  accessibilityLabel,
  marked = false,
}: {
  axis: 'x' | 'y';
  value: number;
  onChange: (next: number) => void;
  /** Return the value at drag start (used to freeze flex columns to pixels). */
  onBegin?: () => number;
  min: number;
  max: number;
  accessibilityLabel: string;
  marked?: boolean;
}) {
  const dragging = useRef(false);
  const originPage = useRef(0);
  const originValue = useRef(value);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const onBeginRef = useRef(onBegin);
  valueRef.current = value;
  onChangeRef.current = onChange;
  onBeginRef.current = onBegin;
  const theme = useTheme();

  function beginAt(page: number) {
    dragging.current = true;
    originPage.current = page;
    originValue.current = onBeginRef.current?.() ?? valueRef.current;
  }

  function moveTo(page: number) {
    if (!dragging.current) return;
    onChangeRef.current(clamp(originValue.current + (page - originPage.current), min, max));
  }

  function endDrag() {
    dragging.current = false;
  }

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => {
          beginAt(axis === 'x' ? event.nativeEvent.pageX : event.nativeEvent.pageY);
        },
        onPanResponderMove: (event) => {
          moveTo(axis === 'x' ? event.nativeEvent.pageX : event.nativeEvent.pageY);
        },
        onPanResponderRelease: endDrag,
        onPanResponderTerminate: endDrag,
      }),
    [axis],
  );

  const webHandlers =
    Platform.OS === 'web'
      ? {
          onPointerDown: (event: {
            preventDefault?: () => void;
            stopPropagation?: () => void;
            nativeEvent: { pageX: number; pageY: number };
          }) => {
            event.preventDefault?.();
            event.stopPropagation?.();
            const page = axis === 'x' ? event.nativeEvent.pageX : event.nativeEvent.pageY;
            beginAt(page);
            const onMove = (native: PointerEvent) => {
              native.preventDefault();
              moveTo(axis === 'x' ? native.pageX : native.pageY);
            };
            const onUp = () => {
              window.removeEventListener('pointermove', onMove, true);
              window.removeEventListener('pointerup', onUp, true);
              endDrag();
            };
            window.addEventListener('pointermove', onMove, true);
            window.addEventListener('pointerup', onUp, true);
          },
        }
      : pan.panHandlers;

  return (
    <View
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: Math.round(value) }}
      collapsable={false}
      {...webHandlers}
      style={[
        {
          position: 'absolute',
          zIndex: 3,
          alignItems: 'center',
          justifyContent: 'center',
        },
        axis === 'x'
          ? { top: 0, right: -6, bottom: 0, width: 12 }
          : { left: 0, right: 12, bottom: -4, height: 8 },
        Platform.OS === 'web'
          ? ({
              cursor: axis === 'x' ? 'col-resize' : 'row-resize',
              touchAction: 'none',
              userSelect: 'none',
            } as unknown as ViewStyle)
          : null,
      ]}
    >
      {marked ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            backgroundColor: theme.colors.borderStrong,
            borderRadius: 1,
            ...(axis === 'x'
              ? { top: 6, bottom: 6, width: 2 }
              : { left: theme.spacing.md, right: theme.spacing.md, height: 2 }),
          }}
        />
      ) : null}
    </View>
  );
}

function TableSkeleton({ desktop }: { desktop: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      {Array.from({ length: 6 }, (_, key) => (
        <Skeleton key={key} height={desktop ? 44 : 64} radius="md" />
      ))}
    </View>
  );
}

/**
 * Column grid for admin / resource lists.
 * Desktop (`lg+`) shows aligned header + cells; phone stacks the first column as
 * the title and the rest as a caption.
 *
 * Out of the box: freeform `q` search, optional per-column filters (`filterable`),
 * drag-to-resize columns and row height.
 */
export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowPress,
  selectedId,
  actions,
  isLoading = false,
  ListHeaderComponent,
  ListEmptyComponent,
  contentContainerStyle,
  filters,
  filterValues,
  defaultFilterValues,
  onFilterValuesChange,
  rowHeight: rowHeightProp,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isDesktop } = useResponsive();
  const [sortId, setSortId] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [headerWidths, setHeaderWidths] = useState<Record<string, number>>({});
  const defaultRowHeight = rowHeightProp ?? theme.responsiveSpace.touch.xs;
  const [rowHeight, setRowHeight] = useState(defaultRowHeight);
  const [internalFilterValues, setInternalFilterValues] = useState<Record<string, string>>(
    defaultFilterValues ?? {},
  );
  const columnWidthsRef = useRef(columnWidths);
  const headerWidthsRef = useRef(headerWidths);
  const columnsRef = useRef(columns);
  columnWidthsRef.current = columnWidths;
  headerWidthsRef.current = headerWidths;
  columnsRef.current = columns;

  function freezeColumnWidths(): Record<string, number> {
    const next = { ...columnWidthsRef.current };
    for (const column of columnsRef.current) {
      next[column.id] =
        next[column.id] ?? headerWidthsRef.current[column.id] ?? column.width ?? 140;
    }
    columnWidthsRef.current = next;
    setColumnWidths(next);
    return next;
  }

  function beginColumnResize(columnId: string): number {
    return freezeColumnWidths()[columnId] ?? 140;
  }

  function setColumnWidth(columnId: string, width: number) {
    const next = { ...columnWidthsRef.current, [columnId]: width };
    columnWidthsRef.current = next;
    setColumnWidths(next);
  }

  const resolvedFilters = useMemo(() => resolveTableFilters(columns, filters), [columns, filters]);
  const values = filterValues ?? internalFilterValues;

  function setValues(next: Record<string, string>) {
    if (filterValues == null) setInternalFilterValues(next);
    onFilterValuesChange?.(next);
  }

  const filtered = useMemo(
    () => applyTableFilters(data, columns, resolvedFilters, values),
    [columns, data, resolvedFilters, values],
  );

  const sortColumn = columns.find((column) => column.id === sortId);
  const sorted = useMemo(
    () => sortTableRows(filtered, sortColumn, sortDir),
    [filtered, sortColumn, sortDir],
  );

  function toggleSort(column: DataTableColumn<T>) {
    if (!column.sortable || !column.accessor) return;
    if (sortId === column.id) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortId(column.id);
    setSortDir('asc');
  }

  const empty: ReactElement | null | undefined =
    isLoading && data.length === 0 ? <TableSkeleton desktop={isDesktop} /> : ListEmptyComponent;

  const lineCount = Math.max(
    1,
    Math.floor((rowHeight - theme.spacing.md) / theme.typography.lineHeight.sm),
  );

  const filterForm =
    resolvedFilters.length > 0 ? (
      <DataTableFilters filters={resolvedFilters} values={values} onChange={setValues} />
    ) : null;

  if (!isDesktop) {
    return (
      <View style={{ flex: 1 }}>
        {ListHeaderComponent}
        {filterForm}
        <List
          data={sorted}
          keyExtractor={keyExtractor}
          recycleItems={false}
          gap="md"
          width="full"
          contentContainerStyle={contentContainerStyle}
          ListEmptyComponent={empty}
          renderItem={({ item }) => {
            const primary = columns[0];
            if (!primary) return null;
            const rest = columns.slice(1);
            const captionParts: string[] = [];
            const extras: DataTableColumn<T>[] = [];
            for (const column of rest) {
              if (column.render) {
                extras.push(column);
                continue;
              }
              const value = cellText(column, item);
              if (value !== '—') captionParts.push(value);
            }
            const caption = captionParts.join(' · ');
            const selected = selectedId === keyExtractor(item);
            const trailing = actions?.(item);
            return (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  paddingVertical: theme.spacing.lg,
                  paddingHorizontal: theme.spacing.lg,
                  backgroundColor: selected ? theme.colors.surfaceMuted : theme.colors.surface,
                  borderRadius: theme.radius.lg,
                  borderWidth: 1,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  ...theme.elevation.low,
                }}
              >
                <Pressable
                  accessibilityRole={onRowPress ? 'button' : undefined}
                  onPress={onRowPress ? () => onRowPress(item) : undefined}
                  style={({ pressed }) => ({
                    flex: 1,
                    gap: theme.spacing.xs,
                    opacity: pressed && onRowPress ? 0.88 : 1,
                  })}
                >
                  {primary.render ? (
                    primary.render(item)
                  ) : (
                    <Text variant="body" weight="semibold" numberOfLines={1}>
                      {cellText(primary, item)}
                    </Text>
                  )}
                  {caption ? (
                    <Text variant="caption" tone="muted" numberOfLines={2}>
                      {caption}
                    </Text>
                  ) : null}
                  {extras.length > 0 ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                      {extras.map((column) => (
                        <View key={column.id}>{column.render?.(item)}</View>
                      ))}
                    </View>
                  ) : null}
                </Pressable>
                {trailing}
              </View>
            );
          }}
        />
      </View>
    );
  }

  const tableWidth = columns.every((column) => columnWidths[column.id] != null)
    ? columns.reduce((sum, column) => sum + columnWidths[column.id], 0) +
      theme.spacing.sm * Math.max(0, columns.length - 1) +
      theme.spacing.md * 2 +
      (actions ? 44 + theme.spacing.sm : 0)
    : undefined;

  const header = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.surfaceMuted,
        position: 'relative',
        overflow: 'visible',
        minWidth: tableWidth,
      }}
    >
      {columns.map((column) => {
        const active = sortId === column.id;
        const sortable = Boolean(column.sortable && column.accessor);
        const align = column.align === 'right' ? 'flex-end' : 'flex-start';
        const measured = columnWidths[column.id] ?? headerWidths[column.id] ?? column.width ?? 0;
        return (
          <View
            key={column.id}
            onLayout={(event) => {
              const width = event.nativeEvent.layout.width;
              setHeaderWidths((current) =>
                current[column.id] === width ? current : { ...current, [column.id]: width },
              );
            }}
            style={[
              columnBoxStyle(column, columnWidths),
              { position: 'relative', overflow: 'visible' },
            ]}
          >
            <Pressable
              accessibilityRole={sortable ? 'button' : undefined}
              accessibilityLabel={sortable ? `${column.header}, sort` : column.header}
              disabled={!sortable}
              onPress={() => toggleSort(column)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: align,
                gap: theme.spacing.xs,
                minHeight: theme.spacing.xl,
              }}
            >
              <Text variant="label" tone="muted" numberOfLines={1}>
                {column.header}
              </Text>
              {sortable ? (
                <Ionicons
                  name={
                    active
                      ? sortDir === 'asc'
                        ? 'chevron-up'
                        : 'chevron-down'
                      : 'swap-vertical-outline'
                  }
                  size={14}
                  color={active ? theme.colors.primary : theme.colors.textMuted}
                />
              ) : null}
            </Pressable>
            {measured > 0 ? (
              <ResizeHandle
                axis="x"
                marked
                value={measured}
                min={72}
                max={640}
                accessibilityLabel={`${t('table.resizeColumn')}: ${column.header}`}
                onBegin={() => beginColumnResize(column.id)}
                onChange={(width) => setColumnWidth(column.id, width)}
              />
            ) : null}
          </View>
        );
      })}
      {actions ? <View style={{ width: 44 }} /> : null}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {ListHeaderComponent}
      {filterForm}
      <View
        style={{
          flex: 1,
          minHeight: 0,
          ...(Platform.OS === 'web' ? ({ overflow: 'auto' } as unknown as ViewStyle) : null),
        }}
      >
        {header}
        <List
          data={sorted}
          keyExtractor={keyExtractor}
          gap="none"
          width="full"
          recycleItems={false}
          estimatedItemSize={rowHeight}
          extraData={{ columnWidths, rowHeight }}
          contentContainerStyle={contentContainerStyle}
          ListEmptyComponent={empty}
          renderItem={({ item }) => {
            const selected = selectedId === keyExtractor(item);
            return (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.md,
                  minHeight: rowHeight,
                  height: rowHeight,
                  minWidth: tableWidth,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                  backgroundColor: selected ? theme.colors.surfaceMuted : theme.colors.surface,
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                {columns.map((column) => (
                  <View
                    key={column.id}
                    style={[
                      columnBoxStyle(column, columnWidths),
                      {
                        position: 'relative',
                        overflow: 'visible',
                        alignSelf: 'stretch',
                        justifyContent: 'center',
                        alignItems: column.align === 'right' ? 'flex-end' : 'flex-start',
                      },
                    ]}
                  >
                    <Pressable
                      accessibilityRole={onRowPress ? 'button' : undefined}
                      onPress={onRowPress ? () => onRowPress(item) : undefined}
                      style={({ pressed }) => ({
                        flex: 1,
                        alignSelf: 'stretch',
                        justifyContent: 'center',
                        opacity: pressed && onRowPress ? 0.88 : 1,
                      })}
                    >
                      {column.render ? (
                        column.render(item)
                      ) : (
                        <Text
                          variant="body"
                          numberOfLines={lineCount}
                          style={{ textAlign: column.align === 'right' ? 'right' : 'left' }}
                        >
                          {cellText(column, item)}
                        </Text>
                      )}
                    </Pressable>
                    <ResizeHandle
                      axis="x"
                      value={
                        columnWidths[column.id] ?? headerWidths[column.id] ?? column.width ?? 140
                      }
                      min={72}
                      max={640}
                      accessibilityLabel={`${t('table.resizeColumn')}: ${column.header}`}
                      onBegin={() => beginColumnResize(column.id)}
                      onChange={(width) => setColumnWidth(column.id, width)}
                    />
                  </View>
                ))}
                {actions ? (
                  <View style={{ width: 44, alignItems: 'flex-end' }}>{actions(item)}</View>
                ) : null}
                <ResizeHandle
                  axis="y"
                  value={rowHeight}
                  min={36}
                  max={160}
                  accessibilityLabel={t('table.resizeRow')}
                  onChange={setRowHeight}
                />
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}
