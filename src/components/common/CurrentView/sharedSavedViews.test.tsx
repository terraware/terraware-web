import React from 'react';

import {
  EditableTable,
  EditableTableInstance,
  EditableTableToolbarContext,
  EditableTableV2,
} from '@terraware/web-components';
import { screen, waitFor, within } from '@testing-library/react';

import strings from 'src/strings';
import { mockGet, renderWithProviders } from 'src/test-utils';
import { TABLES } from 'src/types/Tables';

import CurrentView from './index';
import { getDefaultTableSettings, getTableSettings, isTableModified } from './tableSettings';
import { getSaveViewSummary } from './viewSummary';

type Row = { name: string; count: number };
const storageKey = `${TABLES.species.storageKey}-currentView`;
afterEach(() => localStorage.removeItem(storageKey));

it.each([false, true])('restores and resets saved open ranges and public pinning (V2: %s)', async (v2) => {
  const settings = {
    columnFilters: [{ id: 'count', value: [2, null] }],
    columnOrder: ['count', 'name'],
    columnPinning: { left: ['count'], right: ['name'] },
    columnVisibility: {},
    globalFilter: '',
    sorting: [{ id: 'count', desc: true }],
  };
  localStorage.setItem(storageKey, JSON.stringify({ preset: 'default', savedViewId: '42' }));
  mockGet('/api/v1/users/me/savedTableViews', {
    views: [{ id: 42, name: 'Counts', baseView: 'default', settings, tableName: TABLES.species.stableId }],
  });
  let table!: EditableTableInstance<Row>;
  const Table = v2 ? EditableTableV2<Row> : EditableTable<Row>;
  const { user } = renderWithProviders(
    <Table
      clearAllFiltersLabel='Clear'
      columns={[
        { id: 'name', accessorKey: 'name', header: 'Name' },
        { id: 'count', accessorKey: 'count', header: 'Count', filterVariant: 'range' },
      ]}
      data={[
        { name: 'Alpha', count: 1 },
        { name: 'Bravo', count: 2 },
      ]}
      enableColumnPinning
      enableColumnFilters
      tableOptions={{ initialState: { columnPinning: { left: ['name'], right: [] }, columnOrder: ['name', 'count'] } }}
      renderTopToolbarCustomActions={({ table: instance }: EditableTableToolbarContext<Row>) => {
        table = instance;
        return <CurrentView table={instance} tableDefinition={TABLES.species} organizationId={1} />;
      }}
    />
  );
  await waitFor(() => expect(screen.queryByRole('cell', { name: 'Alpha' })).not.toBeInTheDocument());
  expect(screen.getByRole('cell', { name: 'Bravo' })).toBeVisible();
  expect(getTableSettings(table)).toMatchObject({ ...settings, columnFilters: [{ id: 'count', value: [2, ''] }] });
  const defaults = getDefaultTableSettings(table);
  expect(defaults.columnPinning).toEqual({ left: ['name'], right: [] });
  expect(isTableModified(table, settings, defaults)).toBe(false);
  expect(getSaveViewSummary(table, getTableSettings(table))).toContain(
    strings.formatString(strings.VIEW_SUMMARY_FILTER, 'Count', '≥ 2')
  );
  await user.click(screen.getByRole('combobox', { name: new RegExp(strings.CURRENT_VIEW) }));
  await user.click(within(await screen.findByRole('listbox')).getByText(strings.DEFAULT, { exact: true }));
  await waitFor(() => expect(screen.getByRole('cell', { name: 'Alpha' })).toBeVisible());
  expect(getTableSettings(table).columnPinning).toEqual(defaults.columnPinning);
  expect(isTableModified(table, {}, defaults)).toBe(false);
});
