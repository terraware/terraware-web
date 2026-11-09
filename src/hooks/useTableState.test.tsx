import React from 'react';

import { EditableTable, EditableTableColumn } from '@terraware/web-components';
import { act, renderHook, screen } from '@testing-library/react';
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
  const { pagination, onPaginationChange, autoResetPageIndex, isLoadingPage } = useTableState(
    { storageKey, stableId: storageKey },
    {
      persistPageIndex: { isLoading },
    }
  );

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

describe('persisted column pinning and global filter', () => {
  const pinningKey = `${storageKey}-columnPinning`;
  const globalFilterKey = `${storageKey}-globalFilter`;
  const defaultColumnPinning = { left: ['name'] };
  const clearKeys = () => {
    localStorage.removeItem(pinningKey);
    localStorage.removeItem(globalFilterKey);
  };
  const renderTableState = (options: Parameters<typeof useTableState>[1]) =>
    renderHook(() => useTableState({ storageKey, stableId: storageKey }, { defaultColumnPinning, ...options }));

  beforeEach(clearKeys);
  afterEach(clearKeys);

  it('ignores and does not write saved values when persistence is off', () => {
    localStorage.setItem(pinningKey, JSON.stringify({ left: ['group'] }));
    localStorage.setItem(globalFilterKey, 'saved');
    const { result } = renderTableState({});

    expect(result.current.columnPinning).toEqual(defaultColumnPinning);
    expect(result.current.globalFilter).toBe('');
    expect(result.current.showGlobalFilter).toBe(false);

    act(() => {
      result.current.setColumnPinning({ right: ['name'] });
      result.current.setGlobalFilter('new');
    });

    expect(localStorage.getItem(pinningKey)).toBe(JSON.stringify({ left: ['group'] }));
    expect(localStorage.getItem(globalFilterKey)).toBe('saved');
  });

  it('restores saved column pinning', () => {
    localStorage.setItem(pinningKey, JSON.stringify({ right: ['group'] }));
    const { result } = renderTableState({ persistColumnPinning: true });

    expect(result.current.columnPinning).toEqual({ right: ['group'] });
  });

  it('falls back to the default pinning when nothing is saved', () => {
    const { result } = renderTableState({ persistColumnPinning: true });

    expect(result.current.columnPinning).toEqual(defaultColumnPinning);
  });

  it('falls back to the default pinning when saved pinning is invalid JSON', () => {
    localStorage.setItem(pinningKey, '{not json');
    const { result } = renderTableState({ persistColumnPinning: true });

    expect(result.current.columnPinning).toEqual(defaultColumnPinning);
  });

  it('saves column pinning changes', () => {
    const { result } = renderTableState({ persistColumnPinning: true });

    act(() => result.current.setColumnPinning({ left: ['group'], right: ['name'] }));

    expect(JSON.parse(localStorage.getItem(pinningKey) ?? '')).toEqual({ left: ['group'], right: ['name'] });
  });

  it('restores and saves the global filter', () => {
    localStorage.setItem(globalFilterKey, 'saved');
    const { result } = renderTableState({ persistGlobalFilter: true });

    expect(result.current.globalFilter).toBe('saved');
    expect(result.current.showGlobalFilter).toBe(true);

    act(() => result.current.setGlobalFilter('updated'));

    expect(localStorage.getItem(globalFilterKey)).toBe('updated');
  });
});
