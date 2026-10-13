import React from 'react';

import { EditableTable, EditableTableColumn } from '@terraware/web-components';
import { act, screen } from '@testing-library/react';
import { MRT_Localization_EN } from 'material-react-table/locales/en';

import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

import useTableState from './useTableState';

const storageKey = 'table-page-test';
type Row = { name: string; group: string };
const columns: EditableTableColumn<Row>[] = [
  { id: 'name', header: 'Name', accessorKey: 'name' },
  { id: 'group', header: 'Group', accessorKey: 'group', filterVariant: 'text' },
];
const rows: Row[] = Array.from({ length: 50 }, (_, index) => ({
  name: `Item ${index + 1}`,
  group: index < 15 ? 'Included' : 'Excluded',
}));

const Table = ({ data, isLoading = false }: { data: Row[]; isLoading?: boolean }) => {
  const { pagination, onPaginationChange, autoResetPageIndex, isLoadingPage } = useTableState(storageKey, {
    persistPageIndex: { isLoading },
  });

  return (
    <EditableTable
      clearAllFiltersLabel={strings.CLEAR_ALL_FILTERS}
      columns={columns}
      data={data}
      enableColumnFilters
      stickyFilters
      storageKey={storageKey}
      tableOptions={{ state: { pagination, isLoading: isLoadingPage }, onPaginationChange, autoResetPageIndex }}
    />
  );
};

describe('persisted table page', () => {
  beforeEach(() => {
    sessionStorage.removeItem(`${storageKey}-pageIndex`);
    localStorage.removeItem(`${storageKey}-pageSize`);
    localStorage.removeItem(`${storageKey}_columnFilters`);
  });

  afterEach(() => {
    sessionStorage.removeItem(`${storageKey}-pageIndex`);
    localStorage.removeItem(`${storageKey}-pageSize`);
    localStorage.removeItem(`${storageKey}_columnFilters`);
  });

  it('returns to the saved page when initially empty data finishes loading', async () => {
    sessionStorage.setItem(`${storageKey}-pageIndex`, '2');
    const { rerender } = renderWithProviders(<Table data={[]} isLoading />);

    await act(async () => {
      rerender(<Table data={rows} />);
      await Promise.resolve();
    });

    expect(screen.getByRole('cell', { name: 'Item 21' })).toBeVisible();
    expect(screen.queryByRole('cell', { name: 'Item 1' })).not.toBeInTheDocument();
  });

  it('uses the last filtered page when the saved page no longer exists', async () => {
    sessionStorage.setItem(`${storageKey}-pageIndex`, '3');
    localStorage.setItem(`${storageKey}_columnFilters`, JSON.stringify([{ id: 'group', value: 'Included' }]));
    renderWithProviders(<Table data={rows} />);

    expect(await screen.findByRole('cell', { name: 'Item 11' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Item 15' })).toBeVisible();
    expect(screen.queryByRole('cell', { name: 'Item 1' })).not.toBeInTheDocument();
  });

  it('uses the last filtered page after initially empty data loads', async () => {
    sessionStorage.setItem(`${storageKey}-pageIndex`, '3');
    localStorage.setItem(`${storageKey}_columnFilters`, JSON.stringify([{ id: 'group', value: 'Included' }]));
    const { rerender } = renderWithProviders(<Table data={[]} isLoading />);

    await act(async () => {
      rerender(<Table data={rows} />);
      await Promise.resolve();
    });

    expect(screen.getByRole('cell', { name: 'Item 11' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Item 15' })).toBeVisible();
    expect(screen.queryByRole('cell', { name: 'Item 1' })).not.toBeInTheDocument();
  });

  it('shows an empty first page when loading finishes without results', async () => {
    sessionStorage.setItem(`${storageKey}-pageIndex`, '3');
    const emptyRows: Row[] = [];
    const { rerender } = renderWithProviders(<Table data={emptyRows} isLoading />);

    await act(async () => {
      rerender(<Table data={emptyRows} />);
      await Promise.resolve();
    });

    expect(screen.getByText(MRT_Localization_EN.noRecordsToDisplay)).toBeVisible();
    expect(screen.getByRole('button', { name: MRT_Localization_EN.goToPreviousPage })).toBeDisabled();
  });

  it('returns to the first page when the user changes restored filters', async () => {
    sessionStorage.setItem(`${storageKey}-pageIndex`, '1');
    localStorage.setItem(`${storageKey}_columnFilters`, JSON.stringify([{ id: 'group', value: 'Included' }]));
    const { user } = renderWithProviders(<Table data={rows} />);
    expect(await screen.findByRole('cell', { name: 'Item 11' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: strings.CLEAR_ALL_FILTERS }));

    expect(await screen.findByRole('cell', { name: 'Item 1' })).toBeVisible();
    expect(screen.queryByRole('cell', { name: 'Item 11' })).not.toBeInTheDocument();
  });
});
