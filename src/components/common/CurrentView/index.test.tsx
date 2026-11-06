import React from 'react';

import { act, screen, waitFor, within } from '@testing-library/react';
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table';

import { api as savedTableViewsApi } from 'src/queries/generated/savedTableViews';
import strings from 'src/strings';
import { buildUser, captureRequests, mockGet, renderWithProviders } from 'src/test-utils';
import { TABLES } from 'src/types/Tables';

import CurrentView from './index';

type Row = { name: string; status: string };

const ORG_ID = 1;
const TABLE_DEFINITION = TABLES.species;
const STORAGE_KEY = `${TABLE_DEFINITION.storageKey}-currentView`;
const SAVED_VIEWS_PATH = '/api/v1/users/me/savedTableViews';

const columns: MRT_ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'status', header: 'Status' },
];

const rows: Row[] = [
  { name: 'Alpha', status: 'Active' },
  { name: 'Bravo', status: 'Retired' },
  { name: 'Charlie', status: 'Active' },
];

const savedView = {
  id: 42,
  name: 'Bravo descending',
  baseView: 'default',
  settings: { sorting: [{ id: 'name', desc: true }], columnFilters: [{ id: 'name', value: 'Bravo' }] },
  tableName: TABLE_DEFINITION.stableId,
};

const TableWithCurrentView = () => {
  const table = useMaterialReactTable({ columns, data: rows });
  return (
    <>
      <CurrentView organizationId={ORG_ID} table={table} tableDefinition={TABLE_DEFINITION} />
      <MaterialReactTable table={table} />
    </>
  );
};

const nameHeader = () => screen.getByRole('columnheader', { name: /Name/ });

const currentViewSelect = () => screen.getByRole('combobox', { name: new RegExp(strings.CURRENT_VIEW) });

const expectUnmodified = () => {
  expect(screen.queryByText(`(${strings.MODIFIED})`)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: strings.SAVE_VIEW_BUTTON })).not.toBeInTheDocument();
};

beforeEach(() => {
  mockGet('/api/v1/users/me', { user: buildUser() });
  mockGet('/api/v1/users/me/preferences', { preferences: { savedTableViews: true } });
});

afterEach(() => {
  localStorage.removeItem(STORAGE_KEY);
});

describe('CurrentView restoring a saved view after reload', () => {
  it("applies the stored saved view's sorting and filters to the table", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ preset: 'default', savedViewId: '42' }));
    mockGet(SAVED_VIEWS_PATH, { views: [savedView] });

    renderWithProviders(<TableWithCurrentView />);

    await waitFor(() => expect(nameHeader()).toHaveAttribute('aria-sort', 'descending'));
    expect(screen.getByText('Bravo')).toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    expect(currentViewSelect()).toHaveTextContent(savedView.name);
    expectUnmodified();
  });

  it('leaves the table at its initial state when the stored view no longer exists', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ preset: 'default', savedViewId: '99' }));
    const requests = captureRequests('get', SAVED_VIEWS_PATH, { views: [savedView] });

    renderWithProviders(<TableWithCurrentView />);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(currentViewSelect()).toHaveTextContent(strings.DEFAULT);
    expect(nameHeader()).toHaveAttribute('aria-sort', 'none');
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Bravo')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expectUnmodified();
  });

  it("does not overwrite the user's sorting when the saved views are refetched", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ preset: 'default', savedViewId: '42' }));
    const requests = captureRequests('get', SAVED_VIEWS_PATH, { views: [savedView] });

    const { store, user } = renderWithProviders(<TableWithCurrentView />);

    await waitFor(() => expect(nameHeader()).toHaveAttribute('aria-sort', 'descending'));

    await user.click(within(nameHeader()).getByRole('button', { name: /Sorted by Name descending/ }));
    await waitFor(() => expect(nameHeader()).toHaveAttribute('aria-sort', 'none'));

    const refetchRequests = captureRequests('get', SAVED_VIEWS_PATH, {
      views: [savedView, { ...savedView, id: 43, name: 'Another view' }],
    });
    await act(async () => {
      await store.dispatch(
        savedTableViewsApi.endpoints.listSavedTableViews.initiate(
          { organizationId: ORG_ID, tableName: TABLE_DEFINITION.stableId },
          { forceRefetch: true }
        )
      );
    });

    expect(requests).toHaveLength(1);
    expect(refetchRequests).toHaveLength(1);
    expect(nameHeader()).toHaveAttribute('aria-sort', 'none');
    expect(screen.getByRole('button', { name: strings.SAVE_VIEW_BUTTON })).toBeInTheDocument();
  });
});
