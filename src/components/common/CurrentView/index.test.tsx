import React from 'react';

import { rs } from '@rstest/core';
import { act, screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { MRT_ColumnDef, MaterialReactTable, useMaterialReactTable } from 'material-react-table';

import { api as savedTableViewsApi } from 'src/queries/generated/savedTableViews';
import strings from 'src/strings';
import { buildUser, captureRequests, dialogTitled, mockDelete, mockGet, renderWithProviders } from 'src/test-utils';
import { TABLES } from 'src/types/Tables';

import CurrentView, { ViewOption } from './index';

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

type HarnessProps = { onPresetChange?: (preset: string) => void; presetViews?: ViewOption[] };

const TableWithCurrentView = ({ onPresetChange, presetViews }: HarnessProps = {}) => {
  const table = useMaterialReactTable({ columns, data: rows });
  return (
    <>
      <CurrentView
        onPresetChange={onPresetChange}
        organizationId={ORG_ID}
        presetViews={presetViews}
        table={table}
        tableDefinition={TABLE_DEFINITION}
      />
      <MaterialReactTable table={table} />
    </>
  );
};

const PRESET_VIEWS: ViewOption[] = [{ label: 'Active only', value: 'active' }];

const activeView = {
  id: 43,
  name: 'Active ascending',
  baseView: 'active',
  settings: { sorting: [{ id: 'name', desc: false }], columnFilters: [{ id: 'status', value: 'Active' }] },
  tableName: TABLE_DEFINITION.stableId,
};

const nameHeader = () => screen.getByRole('columnheader', { name: /Name/ });

const currentViewSelect = () => screen.getByRole('combobox', { name: new RegExp(strings.CURRENT_VIEW) });

const expectUnmodified = () => {
  expect(screen.queryByText(`(${strings.MODIFIED})`)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: strings.SAVE_VIEW_BUTTON })).not.toBeInTheDocument();
};

const viewOption = (name: string) => screen.getByRole('option', { name: new RegExp(name) });

const openViewMenu = async (user: UserEvent) => {
  await user.click(await screen.findByRole('combobox', { name: new RegExp(strings.CURRENT_VIEW) }));
  return screen.findByRole('listbox');
};

const chooseView = async (user: UserEvent, name: string) => {
  const listbox = await openViewMenu(user);
  await user.click(within(listbox).getByText(name, { exact: true }));
};

const toggleNameSort = async (user: UserEvent) => {
  await screen.findByRole('combobox', { name: new RegExp(strings.CURRENT_VIEW) });
  await user.click(within(nameHeader()).getByRole('button', { name: /Sort/ }));
};

const expectAllRows = () => {
  expect(screen.getByText('Alpha')).toBeInTheDocument();
  expect(screen.getByText('Bravo')).toBeInTheDocument();
  expect(screen.getByText('Charlie')).toBeInTheDocument();
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

describe('CurrentView choosing a view', () => {
  it("applies the chosen saved view's settings and switches to its base preset", async () => {
    mockGet(SAVED_VIEWS_PATH, { views: [savedView, activeView] });
    const onPresetChange = rs.fn();

    const { user } = renderWithProviders(
      <TableWithCurrentView onPresetChange={onPresetChange} presetViews={PRESET_VIEWS} />
    );
    await chooseView(user, activeView.name);

    await waitFor(() => expect(nameHeader()).toHaveAttribute('aria-sort', 'ascending'));
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.queryByText('Bravo')).not.toBeInTheDocument();
    expect(currentViewSelect()).toHaveTextContent(activeView.name);
    expect(onPresetChange).toHaveBeenLastCalledWith('active');
    expectUnmodified();
  });

  it('keeps the current preset when the saved view is based on a preset that no longer exists', async () => {
    const orphanedView = { ...activeView, id: 44, name: 'Orphaned', baseView: 'removed-preset' };
    mockGet(SAVED_VIEWS_PATH, { views: [orphanedView] });
    const onPresetChange = rs.fn();

    const { user } = renderWithProviders(
      <TableWithCurrentView onPresetChange={onPresetChange} presetViews={PRESET_VIEWS} />
    );
    await chooseView(user, PRESET_VIEWS[0].label);
    await chooseView(user, orphanedView.name);

    await waitFor(() => expect(nameHeader()).toHaveAttribute('aria-sort', 'ascending'));
    expect(currentViewSelect()).toHaveTextContent(orphanedView.name);
    expect(onPresetChange).not.toHaveBeenCalledWith('removed-preset');
    expect(onPresetChange).toHaveBeenLastCalledWith('active');
  });

  it('resets the table to its default settings when Default is chosen after a saved view', async () => {
    mockGet(SAVED_VIEWS_PATH, { views: [savedView] });
    const onPresetChange = rs.fn();

    const { user } = renderWithProviders(
      <TableWithCurrentView onPresetChange={onPresetChange} presetViews={PRESET_VIEWS} />
    );
    await chooseView(user, savedView.name);
    await waitFor(() => expect(nameHeader()).toHaveAttribute('aria-sort', 'descending'));

    await chooseView(user, strings.DEFAULT);

    await waitFor(() => expect(nameHeader()).toHaveAttribute('aria-sort', 'none'));
    expectAllRows();
    expect(currentViewSelect()).toHaveTextContent(strings.DEFAULT);
    expect(onPresetChange).toHaveBeenLastCalledWith('default');
    expectUnmodified();
  });
});

describe('CurrentView modified state', () => {
  it('marks the view as modified and offers to save it when the sorting changes', async () => {
    mockGet(SAVED_VIEWS_PATH, { views: [savedView] });

    const { user } = renderWithProviders(<TableWithCurrentView />);
    await chooseView(user, savedView.name);
    await waitFor(() => expect(nameHeader()).toHaveAttribute('aria-sort', 'descending'));

    await toggleNameSort(user);

    expect(await screen.findByText(`(${strings.MODIFIED})`)).toBeInTheDocument();
    expect(currentViewSelect()).toHaveTextContent(savedView.name);
    expect(screen.getByRole('button', { name: strings.SAVE_VIEW_BUTTON })).toBeInTheDocument();
  });

  it('restores the saved settings and clears the modified state when the same view is chosen again', async () => {
    mockGet(SAVED_VIEWS_PATH, { views: [savedView] });

    const { user } = renderWithProviders(<TableWithCurrentView />);
    await chooseView(user, savedView.name);
    await waitFor(() => expect(nameHeader()).toHaveAttribute('aria-sort', 'descending'));
    await toggleNameSort(user);
    await screen.findByText(`(${strings.MODIFIED})`);

    await chooseView(user, savedView.name);

    await waitFor(() => expect(nameHeader()).toHaveAttribute('aria-sort', 'descending'));
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(currentViewSelect()).toHaveTextContent(savedView.name);
    expectUnmodified();
  });
});

describe('CurrentView saving a view', () => {
  it('omits the Default base from saved view descriptions', async () => {
    mockGet(SAVED_VIEWS_PATH, {
      views: [savedView, activeView, { ...savedView, id: 44, name: 'Empty view', settings: {} }],
    });
    const { user } = renderWithProviders(<TableWithCurrentView presetViews={PRESET_VIEWS} />);

    await openViewMenu(user);

    expect(viewOption(savedView.name)).toHaveTextContent('1 filter. Sorted by name');
    expect(viewOption(savedView.name)).not.toHaveTextContent(`${strings.DEFAULT}.`);
    expect(viewOption('Empty view')).toHaveTextContent(strings.VIEW_SUMMARY_NONE);
    expect(viewOption('Empty view')).not.toHaveTextContent(`${strings.DEFAULT}.`);
    expect(viewOption(activeView.name)).toHaveTextContent('Active only. 1 filter. Sorted by name');
  });

  const newView = {
    id: 50,
    name: 'My new view',
    baseView: 'default',
    settings: { sorting: [{ id: 'name', desc: false }] },
    tableName: TABLE_DEFINITION.stableId,
  };

  const saveInDialog = async (user: UserEvent, name: string) => {
    const dialog = await waitFor(() => dialogTitled(strings.SAVE_VIEW));
    await user.type(within(dialog).getByRole('textbox'), name);
    await user.click(within(dialog).getByRole('button', { name: strings.SAVE_VIEW_BUTTON }));
  };

  it('saves the modified table from the Save View button and selects the new view', async () => {
    const listRequests = captureRequests('get', SAVED_VIEWS_PATH, { views: [savedView] });
    const postRequests = captureRequests('post', SAVED_VIEWS_PATH, { id: newView.id });

    const { user } = renderWithProviders(<TableWithCurrentView />);
    await waitFor(() => expect(listRequests).toHaveLength(1));
    await toggleNameSort(user);
    await waitFor(() => expect(nameHeader()).toHaveAttribute('aria-sort', 'ascending'));

    mockGet(SAVED_VIEWS_PATH, { views: [savedView, newView] });
    await user.click(await screen.findByRole('button', { name: strings.SAVE_VIEW_BUTTON }));
    expect(
      screen.queryByText(strings.formatString(strings.VIEW_SUMMARY_BASE_VIEW, strings.DEFAULT) as string)
    ).not.toBeInTheDocument();
    expect(screen.getByText(strings.formatString(strings.VIEW_SUMMARY_SORT, 'Name ↑') as string)).toBeInTheDocument();
    await saveInDialog(user, newView.name);

    await waitFor(() => expect(postRequests).toHaveLength(1));
    expect(await postRequests[0].json()).toMatchObject({
      baseView: 'default',
      name: newView.name,
      settings: { sorting: [{ id: 'name', desc: false }] },
      tableName: TABLE_DEFINITION.stableId,
    });
    await waitFor(() => expect(currentViewSelect()).toHaveTextContent(newView.name));
    expectUnmodified();
  });

  it('saves from the menu with the current preset as the base view', async () => {
    mockGet(SAVED_VIEWS_PATH, { views: [savedView] });
    const postRequests = captureRequests('post', SAVED_VIEWS_PATH, { id: newView.id });
    const savedNewView = { ...newView, baseView: 'active', settings: {} };

    const { user } = renderWithProviders(<TableWithCurrentView presetViews={PRESET_VIEWS} />);
    await chooseView(user, PRESET_VIEWS[0].label);

    mockGet(SAVED_VIEWS_PATH, { views: [savedView, savedNewView] });
    const listbox = await openViewMenu(user);
    await user.click(within(listbox).getByText(strings.SAVE_TABLE_NEW_VIEW));
    expect(
      screen.getByText(strings.formatString(strings.VIEW_SUMMARY_BASE_VIEW, 'Active only') as string)
    ).toBeInTheDocument();
    await saveInDialog(user, newView.name);

    await waitFor(() => expect(postRequests).toHaveLength(1));
    expect(await postRequests[0].json()).toMatchObject({
      baseView: 'active',
      name: newView.name,
      tableName: TABLE_DEFINITION.stableId,
    });
    await waitFor(() => expect(currentViewSelect()).toHaveTextContent(newView.name));
  });
});

describe('CurrentView deleting a view', () => {
  const deleteFromMenu = async (user: UserEvent, name: string) => {
    await openViewMenu(user);
    await user.click(within(viewOption(name)).getByRole('button', { name: strings.DELETE }));
    const dialog = await waitFor(() => dialogTitled(strings.DELETE_VIEW_TITLE));
    await user.click(within(dialog).getByRole('button', { name: strings.DELETE_VIEW }));
  };

  it('falls back to Default when the active view is deleted', async () => {
    mockGet(SAVED_VIEWS_PATH, { views: [savedView, activeView] });
    const deleteRequests = captureRequests('delete', `${SAVED_VIEWS_PATH}/${savedView.id}`);

    const { user } = renderWithProviders(<TableWithCurrentView />);
    await chooseView(user, savedView.name);
    await waitFor(() => expect(nameHeader()).toHaveAttribute('aria-sort', 'descending'));

    mockGet(SAVED_VIEWS_PATH, { views: [activeView] });
    await deleteFromMenu(user, savedView.name);

    await waitFor(() => expect(deleteRequests).toHaveLength(1));
    await waitFor(() => expect(currentViewSelect()).toHaveTextContent(strings.DEFAULT));
    expect(nameHeader()).toHaveAttribute('aria-sort', 'none');
    expectAllRows();
    expectUnmodified();
  });

  it('keeps the current selection when a different view is deleted', async () => {
    mockGet(SAVED_VIEWS_PATH, { views: [savedView, activeView] });
    mockDelete(`${SAVED_VIEWS_PATH}/${activeView.id}`);

    const { user } = renderWithProviders(<TableWithCurrentView />);
    await chooseView(user, savedView.name);
    await waitFor(() => expect(nameHeader()).toHaveAttribute('aria-sort', 'descending'));

    const refetchRequests = captureRequests('get', SAVED_VIEWS_PATH, { views: [savedView] });
    await deleteFromMenu(user, activeView.name);

    await waitFor(() => expect(refetchRequests).toHaveLength(1));
    expect(currentViewSelect()).toHaveTextContent(savedView.name);
    expect(nameHeader()).toHaveAttribute('aria-sort', 'descending');
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expectUnmodified();
  });
});

describe('CurrentView with saved views turned off', () => {
  const disableSavedViews = () => captureRequests('get', '/api/v1/users/me/preferences', { preferences: {} });

  it('renders nothing when there are no preset views', async () => {
    const preferenceRequests = disableSavedViews();
    const listRequests = captureRequests('get', SAVED_VIEWS_PATH, { views: [savedView] });

    renderWithProviders(<TableWithCurrentView />);

    await waitFor(() => expect(preferenceRequests).toHaveLength(1));
    await screen.findByText('Alpha');
    expect(screen.queryByRole('combobox', { name: new RegExp(strings.CURRENT_VIEW) })).not.toBeInTheDocument();
    expect(listRequests).toHaveLength(0);
  });

  it('offers only the preset views, without saving or a saved-views request', async () => {
    const preferenceRequests = disableSavedViews();
    const listRequests = captureRequests('get', SAVED_VIEWS_PATH, { views: [savedView] });

    const { user } = renderWithProviders(<TableWithCurrentView presetViews={PRESET_VIEWS} />);
    await waitFor(() => expect(preferenceRequests).toHaveLength(1));

    const listbox = await openViewMenu(user);
    expect(within(listbox).getByText(PRESET_VIEWS[0].label)).toBeInTheDocument();
    expect(within(listbox).queryByText(strings.SAVE_TABLE_NEW_VIEW)).not.toBeInTheDocument();
    expect(within(listbox).queryByText(savedView.name)).not.toBeInTheDocument();
    await user.keyboard('{Escape}');

    await toggleNameSort(user);
    await waitFor(() => expect(nameHeader()).toHaveAttribute('aria-sort', 'ascending'));
    expectUnmodified();
    expect(listRequests).toHaveLength(0);
  });
});

describe('CurrentView when the saved views fail to load', () => {
  it('falls back to the stored preset and retries the list when saving a view', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ preset: 'active', savedViewId: '42' }));
    const failedRequests = captureRequests('get', SAVED_VIEWS_PATH, {}, 500);

    const { user } = renderWithProviders(<TableWithCurrentView presetViews={PRESET_VIEWS} />);

    await waitFor(() => expect(failedRequests).toHaveLength(1));
    await waitFor(() => expect(currentViewSelect()).toHaveTextContent(PRESET_VIEWS[0].label));
    expect(nameHeader()).toHaveAttribute('aria-sort', 'none');

    const retryRequests = captureRequests('get', SAVED_VIEWS_PATH, { views: [] });
    const listbox = await openViewMenu(user);
    await user.click(within(listbox).getByText(strings.SAVE_TABLE_NEW_VIEW));

    await waitFor(() => expect(retryRequests).toHaveLength(1));
    expect(dialogTitled(strings.SAVE_VIEW)).toBeInTheDocument();
  });
});
