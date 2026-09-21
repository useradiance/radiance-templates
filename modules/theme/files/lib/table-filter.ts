export type DataTableFilterChoice = {
  id: string;
  name: string;
};

export type DataTableFilterDef<T> = {
  /** `q` is the freeform / full-text filter across accessors (react-admin SearchInput). */
  source: string;
  alwaysOn?: boolean;
  label?: string;
  placeholder?: string;
  choices?: DataTableFilterChoice[];
  match?: (row: T, value: string) => boolean;
};

export type FilterableColumn<T> = {
  id: string;
  header?: string;
  accessor?: (row: T) => string | number | null | undefined;
  filterable?: boolean;
};

function cellSearchText<T>(column: FilterableColumn<T>, row: T): string {
  const value = column.accessor?.(row);
  if (value == null || value === '') return '';
  return String(value).toLowerCase();
}

export function isInactiveFilterValue(value: string | undefined): boolean {
  return (value?.trim() ?? '') === '';
}

/** Full-text match across every column that has an accessor. */
export function matchesFreeform<T>(row: T, columns: FilterableColumn<T>[], query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return columns.some((column) => cellSearchText(column, row).includes(needle));
}

export function matchesColumnFilter<T>(
  row: T,
  column: FilterableColumn<T> | undefined,
  filter: DataTableFilterDef<T>,
  value: string,
): boolean {
  if (filter.match) return filter.match(row, value);
  if (!column) return true;
  const text = cellSearchText(column, row);
  const needle = value.trim().toLowerCase();
  if (filter.choices) {
    const choice = filter.choices.find((entry) => entry.id === value);
    const aliases = [value, choice?.id, choice?.name]
      .filter((entry): entry is string => Boolean(entry))
      .map((entry) => entry.toLowerCase());
    return aliases.some((alias) => text === alias || text.includes(alias));
  }
  return text.includes(needle);
}

/** Client-side FilterForm: `q` plus any per-column / choice filters. */
export function applyTableFilters<T>(
  rows: T[],
  columns: FilterableColumn<T>[],
  filters: DataTableFilterDef<T>[],
  values: Record<string, string>,
): T[] {
  if (filters.length === 0) return rows;
  return rows.filter((row) =>
    filters.every((filter) => {
      const value = values[filter.source];
      if (isInactiveFilterValue(value)) return true;
      const trimmed = value.trim();
      if (filter.choices && trimmed === 'all') return true;
      if (filter.source === 'q') return matchesFreeform(row, columns, trimmed);
      const column = columns.find((entry) => entry.id === filter.source);
      return matchesColumnFilter(row, column, filter, trimmed);
    }),
  );
}

/**
 * React-admin-style defaults: always-on freeform `q`, plus an Add-filter field
 * for every column marked `filterable`. Explicit `filters` override by `source`.
 */
export function resolveTableFilters<T>(
  columns: FilterableColumn<T>[],
  filters: DataTableFilterDef<T>[] | false | undefined,
): DataTableFilterDef<T>[] {
  if (filters === false) return [];
  const bySource = new Map<string, DataTableFilterDef<T>>();
  bySource.set('q', { source: 'q', alwaysOn: true });
  for (const column of columns) {
    if (!column.filterable || !column.accessor || column.id === 'q') continue;
    bySource.set(column.id, {
      source: column.id,
      alwaysOn: false,
      label: column.header,
    });
  }
  for (const filter of filters ?? []) {
    bySource.set(filter.source, filter);
  }
  return [...bySource.values()];
}
