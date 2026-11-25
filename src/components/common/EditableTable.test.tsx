import React, { useState } from 'react';

import { rs } from '@rstest/core';
import { EditableTableColumn, EditableTableToolbarContext, getStrings, isMrtTable } from '@terraware/web-components';
import { screen, waitFor } from '@testing-library/react';
import { MRT_ToggleFiltersButton } from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { MRT_Localization_FR } from 'material-react-table/locales/fr';

import { useFeatureEnabled } from 'src/features';
import { useLocalization } from 'src/providers';
import { LocalizationContext } from 'src/providers/contexts';
import { renderWithProviders } from 'src/test-utils';

import EditableTable, { EditableTableToolbar } from './EditableTable';

rs.mock('src/features', () => ({ useFeatureEnabled: rs.fn() }));

beforeEach(() => rs.mocked(useFeatureEnabled).mockReturnValue(false));

const columns: EditableTableColumn<{ name: string }>[] = [
  { id: 'name', accessorKey: 'name', header: 'Name', filterVariant: 'text' },
];
const data = [{ name: 'Acacia koa' }, { name: 'Other species' }];

const LocalizedTable = ({ locale, empty = false }: { locale: string; empty?: boolean }) => {
  const localization = useLocalization();
  return (
    <LocalizationContext.Provider value={{ ...localization, activeLocale: locale }}>
      <EditableTable
        columns={columns}
        data={empty ? [] : data}
        clearAllFiltersLabel='Clear filters'
        enableColumnFilters
        renderToolbarInternalActions={({ table }) => <MRT_ToggleFiltersButton table={table} />}
        tableOptions={{ localization: { noRecordsToDisplay: 'Custom empty message' } }}
      />
    </LocalizationContext.Provider>
  );
};

it('switches table controls and column menus with the language while preserving filters', async () => {
  const { user, rerender } = renderWithProviders(<LocalizedTable locale='en' />);
  await user.click(screen.getByRole('button', { name: MRT_Localization_EN.showHideFilters }));
  await user.type(screen.getByRole('textbox', { name: 'Filter by Name' }), 'Acacia');
  expect(await screen.findByRole('button', { name: 'Clear filters' })).toBeVisible();

  for (const [locale, labels] of [
    ['en', MRT_Localization_EN],
    ['es', MRT_Localization_ES],
    ['fr', MRT_Localization_FR],
  ] as const) {
    rerender(<LocalizedTable locale={locale} />);
    expect(screen.getByRole('button', { name: labels.showHideFilters })).toBeVisible();
    expect(screen.getByText(labels.rowsPerPage, { exact: false })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeVisible();
    expect(screen.queryByRole('cell', { name: 'Other species' })).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Acacia koa' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: labels.columnActions }));
    expect(await screen.findByRole('menuitem', { name: labels.hideColumn.replace('{column}', 'Name') })).toBeVisible();
    await user.keyboard('{Escape}');
  }
});

it.each(['es', 'fr', 'es-MX', 'gx', 'unrecognized'])('preserves caller overrides for %s', (locale) => {
  renderWithProviders(<LocalizedTable locale={locale} empty />);
  expect(screen.getByText('Custom empty message')).toBeVisible();
});

it.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true],
])('requires the feature flag (%s) and table opt-in (%s)', (flag, optIn) => {
  rs.mocked(useFeatureEnabled).mockReturnValue(flag);
  const props = {
    columns,
    data,
    clearAllFiltersLabel: 'Clear filters',
    renderToolbarInternalActions: ({ table }: EditableTableToolbarContext<{ name: string }>) => (
      <span>{isMrtTable(table) ? 'Legacy controls' : 'V2 controls'}</span>
    ),
  };
  renderWithProviders(optIn ? <EditableTable {...props} supportsV2 /> : <EditableTable {...props} />);
  expect(screen.getByText(flag && optIn ? 'V2 controls' : 'Legacy controls')).toBeVisible();
  expect(screen.getByRole('cell', { name: 'Acacia koa' })).toBeVisible();
});

it.each([false, true])('filters through the shared toolbar (V2: %s)', async (flag) => {
  rs.mocked(useFeatureEnabled).mockReturnValue(flag);
  const { user } = renderWithProviders(
    <EditableTable
      supportsV2
      columns={columns}
      data={data}
      clearAllFiltersLabel='Clear filters'
      enableColumnFilters
      showColumnFiltersButton
      tableOptions={{ initialState: { showColumnFilters: false } }}
    />
  );
  await user.click(screen.getByRole('button', { name: /filters/i }));
  await user.type(screen.getByRole('textbox'), 'Acacia');
  await waitFor(() => expect(screen.queryByRole('cell', { name: 'Other species' })).not.toBeInTheDocument());
  expect(screen.getByRole('button', { name: 'Clear filters' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(await screen.findByRole('cell', { name: 'Other species' })).toBeVisible();
});

it.each([false, true])('hides only the show-all column action (V2: %s)', async (flag) => {
  rs.mocked(useFeatureEnabled).mockReturnValue(flag);
  const { user } = renderWithProviders(
    <EditableTable
      supportsV2
      columns={columns}
      data={data}
      clearAllFiltersLabel='Clear filters'
      enableColumnActions
      enableHiding
      enableShowAllColumnsMenuItem={false}
    />
  );
  const labels = getStrings();
  await user.click(
    screen.getByRole('button', {
      name: flag ? `${labels.TABLE_COLUMN_ACTIONS}: Name` : MRT_Localization_EN.columnActions,
    })
  );
  expect(
    screen.queryByRole('menuitem', {
      name: flag ? labels.TABLE_SHOW_ALL_COLUMNS : MRT_Localization_EN.showAllColumns,
    })
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('menuitem', {
      name: (flag ? labels.TABLE_HIDE_COLUMN : MRT_Localization_EN.hideColumn).replace('{column}', 'Name'),
    })
  ).toBeVisible();
});

it.each([false, true])('opens and closes an initially hidden search (V2: %s)', async (flag) => {
  rs.mocked(useFeatureEnabled).mockReturnValue(flag);
  const ControlledSearch = () => {
    const [showGlobalFilter, onShowGlobalFilterChange] = useState(false);
    return (
      <EditableTable
        supportsV2
        columns={columns}
        data={data}
        clearAllFiltersLabel='Clear filters'
        enableGlobalFilter
        tableOptions={{ state: { showGlobalFilter }, onShowGlobalFilterChange }}
        renderToolbarInternalActions={(context) => <EditableTableToolbar {...context} showGlobalFilterButton />}
      />
    );
  };
  const { user } = renderWithProviders(<ControlledSearch />);
  const toggle = screen.getByRole('button', { name: /show\/hide search/i });
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  await user.click(toggle);
  expect(await screen.findByRole('textbox')).toBeVisible();
  await user.click(toggle);
  await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
});
