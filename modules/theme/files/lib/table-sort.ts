export type SortDirection = 'asc' | 'desc';

export type SortableColumn<T> = {
  accessor?: (row: T) => string | number | null | undefined;
};

export function compareTableValues(left: unknown, right: unknown): number {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

/** Client-side sort for DataTable. Columns without an accessor keep their original order. */
export function sortTableRows<T>(
  rows: T[],
  column: SortableColumn<T> | undefined,
  direction: SortDirection,
): T[] {
  if (!column?.accessor) return rows;
  const copy = [...rows];
  copy.sort((left, right) => {
    const cmp = compareTableValues(column.accessor!(left), column.accessor!(right));
    return direction === 'asc' ? cmp : -cmp;
  });
  return copy;
}
