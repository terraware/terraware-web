import { act, renderHook } from '@testing-library/react';
import dayjs from 'dayjs';
import { MRT_ColumnDef, MRT_TableOptions, useMaterialReactTable } from 'material-react-table';

import {
  TableSettings,
  applyTableSettings,
  getDefaultTableSettings,
  getTableSettings,
  isBlankFilterValue,
  isDataColumnId,
  isTableModified,
  nonEmptyFilters,
} from './tableSettings';

type Row = { name: string; status: string; count: number; date: string };

const columns: MRT_ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'count', header: 'Count' },
  { accessorKey: 'date', header: 'Date' },
];

const data: Row[] = [{ name: 'Alpha', status: 'Active', count: 1, date: '2024-01-01' }];

const renderTable = (options: Partial<MRT_TableOptions<Row>> = {}) =>
  renderHook(() =>
    useMaterialReactTable<Row>({
      columns,
      data,
      enableColumnOrdering: true,
      enableColumnPinning: true,
      enableGlobalFilterRankedResults: false,
      ...options,
    })
  ).result;

const emptySettings: TableSettings = {
  columnFilters: [],
  columnOrder: [],
  columnPinning: {},
  columnVisibility: {},
  globalFilter: '',
  sorting: [],
};

describe('getTableSettings', () => {
  test('reads the persisted settings from the table state', () => {
    const result = renderTable({
      initialState: {
        columnFilters: [{ id: 'name', value: 'Alpha' }],
        columnVisibility: { status: false },
        globalFilter: 'search',
        sorting: [{ id: 'name', desc: true }],
        columnPinning: { left: ['name'] },
      },
    });

    const settings = getTableSettings(result.current);

    expect(settings.columnFilters).toEqual([{ id: 'name', value: 'Alpha' }]);
    expect(settings.columnVisibility).toEqual({ status: false });
    expect(settings.globalFilter).toBe('search');
    expect(settings.sorting).toEqual([{ id: 'name', desc: true }]);
    expect(settings.columnPinning.left).toEqual(['name']);
    expect(settings.columnOrder).toEqual(expect.arrayContaining(['name', 'status', 'count', 'date']));
  });

  test('defaults a missing global filter to an empty string', () => {
    const result = renderTable();

    expect(getTableSettings(result.current).globalFilter).toBe('');
  });

  test('reflects state changes made after the table was created', () => {
    const result = renderTable();

    act(() => result.current.setSorting([{ id: 'count', desc: false }]));

    expect(getTableSettings(result.current).sorting).toEqual([{ id: 'count', desc: false }]);
  });
});

describe('getDefaultTableSettings', () => {
  test('falls back to empty settings when the table has no initial state', () => {
    const result = renderTable({ enableColumnOrdering: false, enableColumnPinning: false });

    expect(getDefaultTableSettings(result.current)).toEqual(
      expect.objectContaining({
        columnFilters: [],
        columnVisibility: {},
        globalFilter: '',
        sorting: [],
      })
    );
  });

  test('uses the initial state rather than the current state', () => {
    const result = renderTable({ initialState: { sorting: [{ id: 'name', desc: false }] } });

    act(() => result.current.setSorting([{ id: 'count', desc: true }]));

    expect(getDefaultTableSettings(result.current).sorting).toEqual([{ id: 'name', desc: false }]);
  });

  test('applies overrides on top of the initial state', () => {
    const result = renderTable({
      initialState: { sorting: [{ id: 'name', desc: false }], columnVisibility: { status: false } },
    });

    const defaults = getDefaultTableSettings(result.current, { sorting: [{ id: 'date', desc: true }] });

    expect(defaults.sorting).toEqual([{ id: 'date', desc: true }]);
    expect(defaults.columnVisibility).toEqual({ status: false });
  });
});

describe('applyTableSettings', () => {
  test('sets every setting on the table', () => {
    const result = renderTable();
    const settings: TableSettings = {
      columnFilters: [{ id: 'name', value: 'Alpha' }],
      columnOrder: ['date', 'count', 'status', 'name'],
      columnPinning: { left: ['name'], right: [] },
      columnVisibility: { count: false },
      globalFilter: 'abc',
      sorting: [{ id: 'status', desc: true }],
    };

    act(() => applyTableSettings(result.current, settings, emptySettings));

    expect(getTableSettings(result.current)).toEqual(settings);
  });

  test('falls back to the defaults for settings that are not provided', () => {
    const result = renderTable();
    const defaults: TableSettings = {
      ...emptySettings,
      columnVisibility: { status: false },
      sorting: [{ id: 'name', desc: false }],
    };

    act(() => applyTableSettings(result.current, { globalFilter: 'abc' }, defaults));

    const settings = getTableSettings(result.current);
    expect(settings.globalFilter).toBe('abc');
    expect(settings.columnVisibility).toEqual({ status: false });
    expect(settings.sorting).toEqual([{ id: 'name', desc: false }]);
  });

  test('keeps the row selection column first when the order omits it', () => {
    const result = renderTable({ enableRowSelection: true });

    act(() =>
      applyTableSettings(result.current, {}, { ...emptySettings, columnOrder: ['date', 'count', 'status', 'name'] })
    );

    expect(getTableSettings(result.current).columnOrder).toEqual(['mrt-row-select', 'date', 'count', 'status', 'name']);
    expect(result.current.getVisibleLeafColumns()[0].id).toBe('mrt-row-select');
  });

  test('moves a misplaced row selection column back to the start', () => {
    const result = renderTable({ enableRowSelection: true });

    act(() =>
      applyTableSettings(result.current, { columnOrder: ['name', 'status', 'mrt-row-select', 'count'] }, emptySettings)
    );

    expect(getTableSettings(result.current).columnOrder).toEqual(['mrt-row-select', 'name', 'status', 'count', 'date']);
  });

  test('restores date filters that were serialized as ISO strings', () => {
    const result = renderTable();
    const iso = '2024-03-04T00:00:00.000Z';

    act(() =>
      applyTableSettings(result.current, { columnFilters: [{ id: 'date', value: [iso, null] }] }, emptySettings)
    );

    const [filter] = getTableSettings(result.current).columnFilters;
    const [min, max] = filter.value as unknown[];
    expect(dayjs.isDayjs(min)).toBe(true);
    expect((min as dayjs.Dayjs).toISOString()).toBe(iso);
    expect(max).toBe('');
  });
});

describe('helpers', () => {
  test.each([
    [undefined, true],
    [null, true],
    ['', true],
    [0, false],
    [false, false],
    ['a', false],
  ])('isBlankFilterValue(%j) is %s', (value, expected) => {
    expect(isBlankFilterValue(value)).toBe(expected);
  });

  test('nonEmptyFilters drops blank and all-blank range filters', () => {
    expect(
      nonEmptyFilters([
        { id: 'a', value: '' },
        { id: 'b', value: [undefined, null] },
        { id: 'c', value: [1, undefined] },
        { id: 'd', value: 'x' },
        { id: 'e', value: [] },
      ])
    ).toEqual([
      { id: 'c', value: [1, undefined] },
      { id: 'd', value: 'x' },
    ]);
  });

  test('isDataColumnId excludes MRT display columns', () => {
    expect(isDataColumnId('name')).toBe(true);
    expect(isDataColumnId('mrt-row-select')).toBe(false);
  });
});

describe('isTableModified', () => {
  const setup = (options: Partial<MRT_TableOptions<Row>> = {}, overrides?: Partial<TableSettings>) => {
    const result = renderTable(options);
    const defaults = getDefaultTableSettings(result.current, overrides);
    return { result, defaults };
  };

  test('is not modified when the table matches the defaults', () => {
    const { result, defaults } = setup();

    expect(isTableModified(result.current, {}, defaults)).toBe(false);
  });

  test('is not modified when the table matches a non-empty initial state', () => {
    const { result, defaults } = setup({
      initialState: {
        sorting: [{ id: 'name', desc: false }],
        columnVisibility: { status: false },
        columnFilters: [{ id: 'name', value: 'A' }],
      },
    });

    expect(isTableModified(result.current, {}, defaults)).toBe(false);
  });

  describe('sorting', () => {
    test('is modified when sorting is added', () => {
      const { result, defaults } = setup();

      act(() => result.current.setSorting([{ id: 'name', desc: false }]));

      expect(isTableModified(result.current, {}, defaults)).toBe(true);
    });

    test('is modified when the sort direction differs', () => {
      const { result, defaults } = setup();

      act(() => result.current.setSorting([{ id: 'name', desc: true }]));

      expect(isTableModified(result.current, { sorting: [{ id: 'name', desc: false }] }, defaults)).toBe(true);
    });

    test('is modified when the multi-sort order differs', () => {
      const { result, defaults } = setup();

      act(() =>
        result.current.setSorting([
          { id: 'name', desc: false },
          { id: 'count', desc: false },
        ])
      );

      expect(
        isTableModified(
          result.current,
          {
            sorting: [
              { id: 'count', desc: false },
              { id: 'name', desc: false },
            ],
          },
          defaults
        )
      ).toBe(true);
    });

    test('is not modified when sorting matches the saved view', () => {
      const { result, defaults } = setup();

      act(() => result.current.setSorting([{ id: 'name', desc: true }]));

      expect(isTableModified(result.current, { sorting: [{ id: 'name', desc: true }] }, defaults)).toBe(false);
    });
  });

  describe('filters', () => {
    test('is modified when a column filter is added', () => {
      const { result, defaults } = setup();

      act(() => result.current.setColumnFilters([{ id: 'name', value: 'A' }]));

      expect(isTableModified(result.current, {}, defaults)).toBe(true);
    });

    test('is modified when a filter value differs from the saved view', () => {
      const { result, defaults } = setup();

      act(() => result.current.setColumnFilters([{ id: 'name', value: 'B' }]));

      expect(isTableModified(result.current, { columnFilters: [{ id: 'name', value: 'A' }] }, defaults)).toBe(true);
    });

    test('ignores filters whose values are blank', () => {
      const { result, defaults } = setup();

      act(() =>
        result.current.setColumnFilters([
          { id: 'name', value: '' },
          { id: 'count', value: [undefined, undefined] },
        ])
      );

      expect(isTableModified(result.current, {}, defaults)).toBe(false);
    });

    test('treats null and undefined range bounds as equal', () => {
      const { result, defaults } = setup();

      act(() => result.current.setColumnFilters([{ id: 'count', value: [1, undefined] }]));

      expect(isTableModified(result.current, { columnFilters: [{ id: 'count', value: [1, null] }] }, defaults)).toBe(
        false
      );
    });

    test('compares dayjs filter values by instant', () => {
      const { result, defaults } = setup();
      const iso = '2024-03-04T00:00:00.000Z';

      act(() => result.current.setColumnFilters([{ id: 'date', value: [dayjs(iso), undefined] }]));

      expect(
        isTableModified(result.current, { columnFilters: [{ id: 'date', value: [dayjs(iso), undefined] }] }, defaults)
      ).toBe(false);
      expect(
        isTableModified(
          result.current,
          { columnFilters: [{ id: 'date', value: [dayjs('2024-03-05T00:00:00.000Z'), undefined] }] },
          defaults
        )
      ).toBe(true);
    });

    test('is modified when the global filter is set', () => {
      const { result, defaults } = setup();

      act(() => result.current.setGlobalFilter('abc'));

      expect(isTableModified(result.current, {}, defaults)).toBe(true);
    });

    test('is not modified when the global filter matches the saved view', () => {
      const { result, defaults } = setup();

      act(() => result.current.setGlobalFilter('abc'));

      expect(isTableModified(result.current, { globalFilter: 'abc' }, defaults)).toBe(false);
    });

    test('treats a cleared global filter as empty', () => {
      const { result, defaults } = setup();

      act(() => result.current.setGlobalFilter(undefined));

      expect(isTableModified(result.current, {}, defaults)).toBe(false);
    });
  });

  describe('column visibility', () => {
    test('is modified when a column is hidden', () => {
      const { result, defaults } = setup();

      act(() => result.current.setColumnVisibility({ status: false }));

      expect(isTableModified(result.current, {}, defaults)).toBe(true);
    });

    test('treats an explicitly visible column the same as an unlisted one', () => {
      const { result, defaults } = setup();

      act(() => result.current.setColumnVisibility({ status: true }));

      expect(isTableModified(result.current, {}, defaults)).toBe(false);
    });

    test('ignores visibility of display columns', () => {
      const { result, defaults } = setup({ enableRowSelection: true });

      act(() => result.current.setColumnVisibility({ 'mrt-row-select': false }));

      expect(isTableModified(result.current, {}, defaults)).toBe(false);
    });

    test('is not modified when hidden columns match the saved view', () => {
      const { result, defaults } = setup();

      act(() => result.current.setColumnVisibility({ status: false }));

      expect(isTableModified(result.current, { columnVisibility: { status: false } }, defaults)).toBe(false);
    });
  });

  describe('column order', () => {
    test('is modified when visible columns are reordered', () => {
      const { result, defaults } = setup();

      act(() => result.current.setColumnOrder(['status', 'name', 'count', 'date']));

      expect(isTableModified(result.current, {}, defaults)).toBe(true);
    });

    test('ignores the position of hidden columns', () => {
      const { result, defaults } = setup({}, { columnOrder: ['name', 'status', 'count', 'date'] });

      act(() => {
        result.current.setColumnVisibility({ status: false });
        result.current.setColumnOrder(['name', 'count', 'date', 'status']);
      });

      expect(isTableModified(result.current, { columnVisibility: { status: false } }, defaults)).toBe(false);
    });

    test('treats a partial order as the listed columns followed by the rest', () => {
      const { result, defaults } = setup();

      act(() => result.current.setColumnOrder(['count', 'name', 'status', 'date']));

      expect(isTableModified(result.current, { columnOrder: ['count'] }, defaults)).toBe(false);
    });

    test('ignores display columns in the order', () => {
      const { result, defaults } = setup({ enableRowSelection: true });
      const dataOrder = ['name', 'status', 'count', 'date'];

      act(() => result.current.setColumnOrder([...dataOrder, 'mrt-row-select']));

      expect(isTableModified(result.current, { columnOrder: ['mrt-row-select', ...dataOrder] }, defaults)).toBe(false);
    });
  });

  describe('column pinning', () => {
    test('is modified when a column is pinned', () => {
      const { result, defaults } = setup();

      act(() => result.current.setColumnPinning({ left: ['name'], right: [] }));

      expect(isTableModified(result.current, {}, defaults)).toBe(true);
    });

    test('ignores pinned display columns and missing sides', () => {
      const { result, defaults } = setup({ enableRowSelection: true });

      act(() => result.current.setColumnPinning({ left: ['mrt-row-select', 'name'] }));

      expect(isTableModified(result.current, { columnPinning: { left: ['name'], right: [] } }, defaults)).toBe(false);
    });

    test('ignores the order of pinned columns relative to unpinned ones', () => {
      const { result, defaults } = setup();

      act(() => {
        result.current.setColumnPinning({ left: ['date'], right: [] });
        result.current.setColumnOrder(['date', 'name', 'status', 'count']);
      });

      expect(
        isTableModified(
          result.current,
          { columnPinning: { left: ['date'], right: [] }, columnOrder: ['name', 'status', 'count', 'date'] },
          defaults
        )
      ).toBe(false);
    });
  });

  describe('baselines', () => {
    test('compares against the saved view rather than the defaults', () => {
      const { result, defaults } = setup();
      const viewSettings: Partial<TableSettings> = {
        sorting: [{ id: 'name', desc: true }],
        columnFilters: [{ id: 'status', value: 'Active' }],
      };

      act(() => applyTableSettings(result.current, viewSettings, defaults));

      expect(isTableModified(result.current, viewSettings, defaults)).toBe(false);
      expect(isTableModified(result.current, {}, defaults)).toBe(true);
    });

    test('fills settings missing from a saved view with the defaults', () => {
      const { result, defaults } = setup({
        initialState: { columnVisibility: { status: false }, sorting: [{ id: 'name', desc: false }] },
      });

      act(() => result.current.setColumnFilters([{ id: 'name', value: 'A' }]));

      expect(isTableModified(result.current, { columnFilters: [{ id: 'name', value: 'A' }] }, defaults)).toBe(false);

      act(() => result.current.setColumnVisibility({}));

      expect(isTableModified(result.current, { columnFilters: [{ id: 'name', value: 'A' }] }, defaults)).toBe(true);
    });

    test('uses default overrides as the baseline for a preset view', () => {
      const { result, defaults } = setup({}, { sorting: [{ id: 'count', desc: true }] });

      expect(isTableModified(result.current, {}, defaults)).toBe(true);

      act(() => result.current.setSorting([{ id: 'count', desc: true }]));

      expect(isTableModified(result.current, {}, defaults)).toBe(false);
    });

    test('treats an undefined saved global filter as empty', () => {
      const { result, defaults } = setup();

      expect(isTableModified(result.current, { globalFilter: undefined }, defaults)).toBe(false);
    });
  });
});
