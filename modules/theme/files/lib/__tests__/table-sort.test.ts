import { compareTableValues, sortTableRows } from '@/lib/table-sort';

describe('compareTableValues', () => {
  it('sorts numbers numerically', () => {
    expect(compareTableValues(2, 10)).toBeLessThan(0);
  });

  it('pushes nulls to the end', () => {
    expect(compareTableValues(null, 'a')).toBeGreaterThan(0);
    expect(compareTableValues('a', null)).toBeLessThan(0);
  });

  it('sorts numeric strings naturally', () => {
    expect(compareTableValues('A-2', 'A-10')).toBeLessThan(0);
  });
});

describe('sortTableRows', () => {
  const rows = [
    { id: 'b', qty: 3 },
    { id: 'a', qty: 1 },
    { id: 'c', qty: 2 },
  ];

  it('returns the original array when the column is not sortable', () => {
    expect(sortTableRows(rows, {}, 'asc')).toBe(rows);
  });

  it('sorts ascending and descending by accessor', () => {
    const column = { accessor: (row: (typeof rows)[number]) => row.qty };
    expect(sortTableRows(rows, column, 'asc').map((row) => row.id)).toEqual(['a', 'c', 'b']);
    expect(sortTableRows(rows, column, 'desc').map((row) => row.id)).toEqual(['b', 'c', 'a']);
  });
});
