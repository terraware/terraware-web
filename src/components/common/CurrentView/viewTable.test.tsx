import React from 'react';

import { EditableTableInstanceV2, EditableTableV2 } from '@terraware/web-components';
import { act, renderHook } from '@testing-library/react';
import { useMaterialReactTable } from 'material-react-table';

import { renderWithProviders } from 'src/test-utils';

import { toViewTable } from './viewTable';

type Row = { name: string; status: string; count: number };
const data: Row[] = [{ name: 'Alpha', status: 'Active, growing', count: 1 }];

const renderV2 = () => {
  let table!: EditableTableInstanceV2<Row>;
  renderWithProviders(
    <EditableTableV2
      clearAllFiltersLabel='Clear'
      data={data}
      enableColumnPinning
      columns={[
        { id: 'name', header: 'Name', accessorKey: 'name' },
        {
          id: 'status',
          header: 'Status',
          accessorKey: 'status',
          filterVariant: 'multi-select',
          filterSelectOptions: ['Active, growing'],
        },
        { id: 'count', header: 'Count', accessorKey: 'count', filterVariant: 'range' },
      ]}
      tableOptions={{
        initialState: { columnPinning: { left: ['name'], right: ['count'] }, columnOrder: ['count', 'status', 'name'] },
      }}
      renderTopToolbarCustomActions={({ table: instance }) => {
        table = instance;
        return null;
      }}
    />
  );
  return { table, view: toViewTable(table) };
};

it('keeps V2 current/initial pinning public and orders columns by displayed pin groups', () => {
  const { view } = renderV2();
  expect(view.getSettings().columnPinning).toEqual({ left: ['name'], right: ['count'] });
  expect(view.getInitialSettings().columnPinning).toEqual({ left: ['name'], right: ['count'] });
  expect(view.getVisibleColumnsInDisplayOrder().map((column) => column.id)).toEqual(['name', 'status', 'count']);
  expect(view.getColumns().find((column) => column.id === 'status')).toMatchObject({
    filterVariant: 'multi-select',
    filterSelectOptions: ['Active, growing'],
    isPinned: false,
  });
  expect(view.getColumns().find((column) => column.id === 'count')).toMatchObject({
    filterVariant: 'range',
    isPinned: true,
  });

  act(() => view.setColumnPinning((previous) => ({ left: [...(previous.left ?? []), 'status'], right: [] })));
  expect(view.getSettings().columnPinning).toEqual({ left: ['name', 'status'], right: [] });
  expect(view.getInitialSettings().columnPinning).toEqual({ left: ['name'], right: ['count'] });
  act(() => view.setColumnPinning({}));
  expect(view.getSettings().columnPinning).toEqual({ left: [], right: [] });
});

it('reads live V2 settings after setters and clears them without leaking MRT display IDs', () => {
  const { view } = renderV2();
  act(() => {
    view.setColumnFilters([{ id: 'status', value: ['Active, growing'] }]);
    view.setColumnOrder(['status', 'mrt-row-actions', 'name', 'count']);
    view.setColumnVisibility({ count: false });
    view.setGlobalFilter('Alpha');
    view.setSorting([{ id: 'name', desc: true }]);
  });
  expect(view.getSettings()).toMatchObject({
    columnFilters: [{ id: 'status', value: ['Active, growing'] }],
    columnOrder: ['status', 'name', 'count'],
    columnVisibility: { count: false },
    globalFilter: 'Alpha',
    sorting: [{ id: 'name', desc: true }],
  });
  expect(view.getVisibleColumnsInDisplayOrder().map((column) => column.id)).toEqual(['name', 'status']);
  act(() => {
    view.setColumnFilters([]);
    view.setGlobalFilter('');
    view.setSorting([]);
  });
  expect(view.getSettings()).toMatchObject({ columnFilters: [], globalFilter: '', sorting: [] });
  expect(toViewTable(view)).toBe(view);
});

it('retains MRT display columns when applying a data-column order', () => {
  const result = renderHook(() =>
    useMaterialReactTable<Row>({
      columns: [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'status', header: 'Status' },
      ],
      data,
      enableRowSelection: true,
      enableColumnOrdering: true,
    })
  ).result;
  act(() => toViewTable(result.current).setColumnOrder(['status', 'name']));
  expect(result.current.getState().columnOrder).toEqual(['mrt-row-select', 'status', 'name']);
});
