import {
  applyTableFilters,
  matchesFreeform,
  resolveTableFilters,
  type DataTableFilterDef,
} from '@/lib/table-filter';

const columns = [
  {
    id: 'sku',
    header: 'SKU',
    accessor: (row: { sku: string; name: string }) => row.sku,
    filterable: true,
  },
  {
    id: 'name',
    header: 'Name',
    accessor: (row: { sku: string; name: string }) => row.name,
    filterable: true,
  },
];

const rows = [
  { sku: 'WB-1', name: 'Widget' },
  { sku: 'WB-2', name: 'Gadget' },
  { sku: 'AA-9', name: 'Bolt' },
];

describe('matchesFreeform', () => {
  it('matches any accessor', () => {
    expect(matchesFreeform(rows[0], columns, 'wid')).toBe(true);
    expect(matchesFreeform(rows[0], columns, 'wb-1')).toBe(true);
    expect(matchesFreeform(rows[0], columns, 'zzz')).toBe(false);
  });
});

describe('applyTableFilters', () => {
  it('applies the freeform q filter', () => {
    const filters: DataTableFilterDef<(typeof rows)[number]>[] = [{ source: 'q', alwaysOn: true }];
    expect(applyTableFilters(rows, columns, filters, { q: 'wb' }).map((row) => row.sku)).toEqual([
      'WB-1',
      'WB-2',
    ]);
  });

  it('treats empty and all as inactive', () => {
    const filters: DataTableFilterDef<(typeof rows)[number]>[] = [{ source: 'q', alwaysOn: true }];
    expect(applyTableFilters(rows, columns, filters, { q: '' })).toEqual(rows);
  });

  it('intersects column filters with q', () => {
    const filters: DataTableFilterDef<(typeof rows)[number]>[] = [
      { source: 'q', alwaysOn: true },
      { source: 'name' },
    ];
    expect(
      applyTableFilters(rows, columns, filters, { q: 'w', name: 'gadget' }).map((row) => row.sku),
    ).toEqual(['WB-2']);
  });

  it('uses a custom match for choice filters', () => {
    type Row = { warehouseId: string };
    const stock = [{ warehouseId: 'a' }, { warehouseId: 'b' }];
    const filters: DataTableFilterDef<Row>[] = [
      {
        source: 'warehouseId',
        choices: [
          { id: 'all', name: 'All' },
          { id: 'a', name: 'Austin' },
        ],
        match: (row, value) => value === 'all' || row.warehouseId === value,
      },
    ];
    expect(applyTableFilters(stock, [], filters, { warehouseId: 'a' })).toEqual([stock[0]]);
    expect(applyTableFilters(stock, [], filters, { warehouseId: 'all' })).toEqual(stock);
  });
});

describe('resolveTableFilters', () => {
  it('defaults to always-on q plus filterable columns', () => {
    const resolved = resolveTableFilters(columns, undefined);
    expect(resolved.map((filter) => filter.source)).toEqual(['q', 'sku', 'name']);
    expect(resolved[0]?.alwaysOn).toBe(true);
    expect(resolved[1]?.alwaysOn).toBe(false);
  });

  it('can disable filters entirely', () => {
    expect(resolveTableFilters(columns, false)).toEqual([]);
  });

  it('lets explicit filters override by source', () => {
    const resolved = resolveTableFilters(columns, [
      { source: 'q', alwaysOn: true, placeholder: 'SKU or name' },
    ]);
    expect(resolved[0]?.placeholder).toBe('SKU or name');
  });
});
