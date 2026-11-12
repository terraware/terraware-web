import React from 'react';

import { EditableTableColumn } from '@terraware/web-components';
import { screen } from '@testing-library/react';
import { MRT_ToggleFiltersButton } from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { MRT_Localization_FR } from 'material-react-table/locales/fr';

import { useLocalization } from 'src/providers';
import { LocalizationContext } from 'src/providers/contexts';
import { renderWithProviders } from 'src/test-utils';

import EditableTable from './EditableTable';

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
