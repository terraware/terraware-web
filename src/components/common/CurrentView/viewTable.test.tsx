import React from 'react';

import { EditableTableColumnV2, EditableTableInstanceV2, EditableTableV2 } from '@terraware/web-components';
import { EditableTableOptionsV2 } from '@terraware/web-components/components/EditableTableV2';
import { act } from '@testing-library/react';

import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

import {
  TableSettings,
  applyTableSettings,
  getDefaultTableSettings,
  getTableSettings,
  isTableModified,
} from './tableSettings';
import { getSaveViewSummary } from './viewSummary';
import { toTableSource } from './viewTable';

type Row = { name: string; status: string; count: number };

const columns: EditableTableColumnV2<Row>[] = [
  { id: 'name', accessorKey: 'name', header: 'Name' },
  { id: 'status', accessorKey: 'status', header: 'Status', filterVariant: 'select', filterSelectOptions: ['active'] },
  { id: 'count', accessorKey: 'count', header: 'Count', filterVariant: 'range' },
];

const data: Row[] = [{ name: 'Alpha', status: 'active', count: 1 }];

const renderTable = (tableOptions?: EditableTableOptionsV2<Row>) => {
  let captured: EditableTableInstanceV2<Row> | undefined;
  renderWithProviders(
    <EditableTableV2<Row>
      clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
      columns={columns}
      data={data}
      enableColumnPinning
      enableColumnFilters
      enableGlobalFilter
      enableSorting
      enableHiding
      renderTopToolbarCustomActions={({ table }) => {
        captured = table;
        return null;
      }}
      tableOptions={tableOptions}
    />
  );
  return { instance: () => captured!, table: () => toTableSource(captured!) };
};

const fmt = (format: string, ...values: (string | number)[]) => strings.formatString(format, ...values) as string;

describe('fromEditableTableV2', () => {
  test('reads initial pinning as left and right in current and default settings', () => {
    const { table } = renderTable({ initialState: { columnPinning: { left: ['name'], right: ['count'] } } });

    expect(getTableSettings(table()).columnPinning).toEqual({ left: ['name'], right: ['count'] });
    expect(getDefaultTableSettings(table()).columnPinning).toEqual({ left: ['name'], right: ['count'] });
  });

  test('applies saved settings to the table', () => {
    const { table } = renderTable();
    const settings: Partial<TableSettings> = {
      columnPinning: { left: ['count'], right: ['name'] },
      columnVisibility: { status: false },
      sorting: [{ id: 'count', desc: true }],
      globalFilter: 'alp',
      columnFilters: [{ id: 'name', value: 'Al' }],
    };

    act(() => applyTableSettings(table(), settings, getDefaultTableSettings(table())));

    expect(getTableSettings(table())).toEqual(expect.objectContaining(settings));
  });

  test('pins columns to the start and end of the underlying table', () => {
    const { instance, table } = renderTable();

    act(() =>
      applyTableSettings(
        table(),
        { columnPinning: { left: ['count'], right: ['name'] } },
        getDefaultTableSettings(table())
      )
    );

    expect(instance().getColumn('count')!.getIsPinned()).toBe('start');
    expect(instance().getColumn('name')!.getIsPinned()).toBe('end');
    expect(instance().getColumn('status')!.getIsPinned()).toBe(false);
  });

  test('is unmodified at defaults and modified after a change', () => {
    const { table } = renderTable({ initialState: { columnPinning: { left: ['name'] } } });
    const defaults = getDefaultTableSettings(table());

    expect(isTableModified(table(), {}, defaults)).toBe(false);

    act(() => applyTableSettings(table(), { sorting: [{ id: 'name', desc: false }] }, defaults));

    expect(isTableModified(table(), {}, defaults)).toBe(true);
  });

  test('summarizes a range filter and lists visible columns in pinned order', () => {
    const { table } = renderTable({ initialState: { columnPinning: { left: ['count'] } } });

    act(() => applyTableSettings(table(), { columnVisibility: { status: false } }, getDefaultTableSettings(table())));

    expect(
      getSaveViewSummary(table(), { ...getTableSettings(table()), columnFilters: [{ id: 'count', value: [1, 5] }] })
    ).toEqual([fmt(strings.VIEW_SUMMARY_FILTER, 'Count', '1 – 5'), fmt(strings.VIEW_SUMMARY_COLUMNS, 'Count, Name')]);
  });
});
