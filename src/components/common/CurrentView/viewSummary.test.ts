import { act, renderHook } from '@testing-library/react';
import dayjs from 'dayjs';
import { MRT_ColumnDef, MRT_TableOptions, useMaterialReactTable } from 'material-react-table';

import strings from 'src/strings';

import { TableSettings } from './tableSettings';
import { getSaveViewSummary, getViewSummary } from './viewSummary';

type Row = { name: string; status: string; count: number; date: string };

const columns: MRT_ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  {
    accessorKey: 'status',
    header: 'Status',
    filterVariant: 'multi-select',
    filterSelectOptions: [
      { label: 'Active Label', value: 'active' },
      { label: 'Retired Label', value: 'retired' },
    ],
  },
  { accessorKey: 'count', header: 'Count', filterVariant: 'range' },
  { accessorKey: 'date', header: 'Date', filterVariant: 'date-range' },
];

const data: Row[] = [{ name: 'Alpha', status: 'active', count: 1, date: '2024-01-01' }];

const renderTable = (options: Partial<MRT_TableOptions<Row>> = {}) =>
  renderHook(() => useMaterialReactTable<Row>({ columns, data, enableRowSelection: true, ...options })).result;

const settingsWith = (overrides: Partial<TableSettings> = {}): TableSettings => ({
  columnFilters: [],
  columnOrder: [],
  columnPinning: {},
  columnVisibility: {},
  globalFilter: '',
  sorting: [],
  ...overrides,
});

const fmt = (format: string, ...values: (string | number)[]) => strings.formatString(format, ...values) as string;

describe('getViewSummary', () => {
  test('describes empty settings as having no filters', () => {
    const result = renderTable();

    expect(getViewSummary(result.current, settingsWith())).toBe(strings.VIEW_SUMMARY_NONE);
  });

  test('includes the base view label first', () => {
    const result = renderTable();

    expect(getViewSummary(result.current, settingsWith(), 'Preset')).toBe(`Preset. ${strings.VIEW_SUMMARY_NONE}`);
  });

  test('describes a single filter', () => {
    const result = renderTable();

    expect(getViewSummary(result.current, settingsWith({ columnFilters: [{ id: 'name', value: 'A' }] }))).toBe(
      strings.VIEW_SUMMARY_FILTER_COUNT_SINGULAR
    );
  });

  test('counts the search text as a filter', () => {
    const result = renderTable();

    expect(getViewSummary(result.current, settingsWith({ globalFilter: 'abc' }))).toBe(
      strings.VIEW_SUMMARY_FILTER_COUNT_SINGULAR
    );
    expect(
      getViewSummary(result.current, settingsWith({ globalFilter: 'abc', columnFilters: [{ id: 'name', value: 'A' }] }))
    ).toBe(fmt(strings.VIEW_SUMMARY_FILTER_COUNT_PLURAL, 2));
  });

  test('ignores blank filters when counting', () => {
    const result = renderTable();

    expect(
      getViewSummary(
        result.current,
        settingsWith({
          columnFilters: [
            { id: 'name', value: '' },
            { id: 'count', value: [undefined, null] },
          ],
        })
      )
    ).toBe(strings.VIEW_SUMMARY_NONE);
  });

  test('lists sorted columns in lower case', () => {
    const result = renderTable();

    expect(
      getViewSummary(
        result.current,
        settingsWith({
          sorting: [
            { id: 'name', desc: false },
            { id: 'count', desc: true },
          ],
        })
      )
    ).toBe(fmt(strings.VIEW_SUMMARY_SORTED_BY, 'name, count'));
  });

  test('falls back to the column id for an unknown sorted column', () => {
    const result = renderTable();

    expect(getViewSummary(result.current, settingsWith({ sorting: [{ id: 'missingColumn', desc: false }] }))).toBe(
      fmt(strings.VIEW_SUMMARY_SORTED_BY, 'missingcolumn')
    );
  });

  test('combines the base view, filters and sorting', () => {
    const result = renderTable();

    expect(
      getViewSummary(
        result.current,
        settingsWith({
          columnFilters: [
            { id: 'name', value: 'A' },
            { id: 'status', value: ['active'] },
          ],
          sorting: [{ id: 'date', desc: true }],
        }),
        'Preset'
      )
    ).toBe(
      ['Preset', fmt(strings.VIEW_SUMMARY_FILTER_COUNT_PLURAL, 2), fmt(strings.VIEW_SUMMARY_SORTED_BY, 'date')].join(
        '. '
      )
    );
  });
});

describe('getSaveViewSummary', () => {
  const allColumns = fmt(strings.VIEW_SUMMARY_COLUMNS, 'Name, Status, Count, Date');

  test('describes empty settings with no filters and all data columns', () => {
    const result = renderTable();

    expect(getSaveViewSummary(result.current, settingsWith())).toEqual([strings.VIEW_SUMMARY_NO_FILTERS, allColumns]);
  });

  test('includes the base view label first', () => {
    const result = renderTable();

    expect(getSaveViewSummary(result.current, settingsWith(), 'Preset')).toEqual([
      fmt(strings.VIEW_SUMMARY_BASE_VIEW, 'Preset'),
      strings.VIEW_SUMMARY_NO_FILTERS,
      allColumns,
    ]);
  });

  test('describes text filters with the column header', () => {
    const result = renderTable();

    expect(
      getSaveViewSummary(result.current, settingsWith({ columnFilters: [{ id: 'name', value: 'Alpha' }] }))
    ).toEqual([fmt(strings.VIEW_SUMMARY_FILTER, 'Name', 'Alpha'), allColumns]);
  });

  test('describes select filters with option labels and skips blank entries', () => {
    const result = renderTable();

    expect(
      getSaveViewSummary(
        result.current,
        settingsWith({ columnFilters: [{ id: 'status', value: ['active', '', 'retired', 'unknown'] }] })
      )
    ).toEqual([fmt(strings.VIEW_SUMMARY_FILTER, 'Status', 'Active Label, Retired Label, unknown'), allColumns]);
  });

  test.each([
    [[1, 5], '1 – 5'],
    [[1, undefined], '≥ 1'],
    [[null, 5], '≤ 5'],
  ])('describes the range filter %j as %s', (value, expected) => {
    const result = renderTable();

    expect(getSaveViewSummary(result.current, settingsWith({ columnFilters: [{ id: 'count', value }] }))).toEqual([
      fmt(strings.VIEW_SUMMARY_FILTER, 'Count', expected),
      allColumns,
    ]);
  });

  test('formats date range filters as dates', () => {
    const result = renderTable();

    expect(
      getSaveViewSummary(
        result.current,
        settingsWith({ columnFilters: [{ id: 'date', value: [dayjs('2024-03-04'), '2024-03-10T12:00:00'] }] })
      )
    ).toEqual([fmt(strings.VIEW_SUMMARY_FILTER, 'Date', '2024-03-04 – 2024-03-10'), allColumns]);
  });

  test('omits blank filters', () => {
    const result = renderTable();

    expect(
      getSaveViewSummary(
        result.current,
        settingsWith({
          columnFilters: [
            { id: 'name', value: '' },
            { id: 'count', value: [undefined, undefined] },
          ],
        })
      )
    ).toEqual([strings.VIEW_SUMMARY_NO_FILTERS, allColumns]);
  });

  test('describes the search text and suppresses the no-filters entry', () => {
    const result = renderTable();

    expect(getSaveViewSummary(result.current, settingsWith({ globalFilter: 'abc' }))).toEqual([
      fmt(strings.VIEW_SUMMARY_SEARCH, 'abc'),
      allColumns,
    ]);
  });

  test('describes sorting with direction arrows', () => {
    const result = renderTable();

    expect(
      getSaveViewSummary(
        result.current,
        settingsWith({
          sorting: [
            { id: 'name', desc: false },
            { id: 'count', desc: true },
          ],
        })
      )
    ).toEqual([fmt(strings.VIEW_SUMMARY_SORT, 'Name ↑, Count ↓'), strings.VIEW_SUMMARY_NO_FILTERS, allColumns]);
  });

  test('lists visible data columns in pinned and display order', () => {
    const result = renderTable({ enableColumnOrdering: true, enableColumnPinning: true });

    act(() => {
      result.current.setColumnVisibility({ status: false });
      result.current.setColumnOrder(['mrt-row-select', 'count', 'name', 'status', 'date']);
      result.current.setColumnPinning({ left: [], right: ['name'] });
    });

    expect(getSaveViewSummary(result.current, settingsWith())).toEqual([
      strings.VIEW_SUMMARY_NO_FILTERS,
      fmt(strings.VIEW_SUMMARY_COLUMNS, 'Count, Date, Name'),
    ]);
  });

  test('orders entries as base view, filters, search, sort, columns', () => {
    const result = renderTable();

    expect(
      getSaveViewSummary(
        result.current,
        settingsWith({
          columnFilters: [{ id: 'name', value: 'Alpha' }],
          globalFilter: 'abc',
          sorting: [{ id: 'date', desc: true }],
        }),
        'Preset'
      )
    ).toEqual([
      fmt(strings.VIEW_SUMMARY_BASE_VIEW, 'Preset'),
      fmt(strings.VIEW_SUMMARY_FILTER, 'Name', 'Alpha'),
      fmt(strings.VIEW_SUMMARY_SEARCH, 'abc'),
      fmt(strings.VIEW_SUMMARY_SORT, 'Date ↓'),
      allColumns,
    ]);
  });
});
