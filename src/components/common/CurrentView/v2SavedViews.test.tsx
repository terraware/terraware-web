import React from 'react';

import { EditableTableInstanceV2, EditableTableV2 } from '@terraware/web-components';
import { act, screen, waitFor, within } from '@testing-library/react';

import strings from 'src/strings';
import { mockGet, renderWithProviders } from 'src/test-utils';
import { TABLES } from 'src/types/Tables';

import CurrentView from './index';
import { applyTableSettings, getDefaultTableSettings, getTableSettings, isTableModified } from './tableSettings';
import { getSavedViewAnalytics } from './tableViewAnalytics';
import { getSaveViewSummary, getViewSummary } from './viewSummary';

type Row = { name: string; count: number };
const storageKey = `${TABLES.species.storageKey}-currentView`;
afterEach(() => localStorage.removeItem(storageKey));

it('restores public saved settings on V2, summarizes them, and resets to initial defaults', async () => {
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
  let table!: EditableTableInstanceV2<Row>;
  const { user } = renderWithProviders(
    <EditableTableV2
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
      tableOptions={{ initialState: { columnPinning: { left: ['name'] }, columnOrder: ['name', 'count'] } }}
      renderTopToolbarCustomActions={({ table: instance }) => {
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
  expect(getSaveViewSummary(table, getTableSettings(table))).toContain(
    strings.formatString(strings.VIEW_SUMMARY_COLUMNS, 'Count, Name')
  );
  expect(getViewSummary(table, getTableSettings(table))).toContain(strings.VIEW_SUMMARY_FILTER_COUNT_SINGULAR);
  expect(getSavedViewAnalytics(table, getTableSettings(table), defaults)).toMatchObject({
    filtered_columns: ['count'],
    has_sort: true,
    columns_reordered: true,
  });

  await user.click(screen.getByRole('combobox', { name: new RegExp(strings.CURRENT_VIEW) }));
  await user.click(within(await screen.findByRole('listbox')).getByText(strings.DEFAULT, { exact: true }));
  await waitFor(() => expect(screen.getByRole('cell', { name: 'Alpha' })).toBeVisible());
  expect(getTableSettings(table).columnPinning).toEqual(defaults.columnPinning);
  expect(isTableModified(table, {}, defaults)).toBe(false);
  act(() => applyTableSettings(table, { globalFilter: 'Bravo' }, defaults));
  expect(isTableModified(table, {}, defaults)).toBe(true);
});
