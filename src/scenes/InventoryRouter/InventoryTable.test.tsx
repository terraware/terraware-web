import React, { useState } from 'react';

import { rstest } from '@rstest/core';
import { TableColumnType } from '@terraware/web-components';
import { screen, waitFor, within } from '@testing-library/react';

import strings from 'src/strings';
import {
  buildFacility,
  buildOrganization,
  buildSpecies,
  buildUser,
  mockGet,
  renderWithProviders,
} from 'src/test-utils';
import { SearchResponseElement } from 'src/types/Search';

import { InventoryFiltersUnion } from './InventoryFilter';
import InventoryTable from './InventoryTable';

type Origin = 'Batches' | 'Nursery' | 'Species';

const currentViewSelect = () => screen.getByRole('combobox', { name: new RegExp(strings.CURRENT_VIEW) });

const renderTable = (
  origin: Origin,
  results: SearchResponseElement[] = [],
  columns: TableColumnType[] = [{ key: 'scientificName', name: strings.SPECIES, type: 'string' }]
) => {
  const setFilters = rstest.fn<(filters: InventoryFiltersUnion) => void>();
  const Harness = () => {
    const [filters, setFiltersState] = useState<InventoryFiltersUnion>({});
    return (
      <InventoryTable
        origin={origin}
        results={results}
        columns={columns}
        filters={filters}
        setFilters={(next) => {
          setFilters(next);
          setFiltersState(next);
        }}
        temporalSearchValue=''
        setTemporalSearchValue={() => undefined}
      />
    );
  };
  const rendered = renderWithProviders(<Harness />, {
    organization: {
      selectedOrganization: buildOrganization({
        id: 7,
        facilities: [
          buildFacility({ id: 101, name: 'Nursery A' }),
          buildFacility({ id: 102, name: 'Nursery B' }),
          buildFacility({ id: 103, name: 'Nursery C' }),
        ],
      }),
    },
  });
  return { ...rendered, setFilters };
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  rstest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  mockGet('/api/v1/species', { species: [buildSpecies({ id: 11, scientificName: 'Acacia koa' })] });
  mockGet('/api/v1/projects', { projects: [] });
  mockGet('/api/v1/facilities/:facilityId/subLocations', { subLocations: [] });
  mockGet('/api/v1/users/me', { user: buildUser() });
  mockGet('/api/v1/users/me/preferences', { preferences: {} });
  mockGet('/api/v1/users/me/savedTableViews', { views: [] });
});

afterEach(() => rstest.restoreAllMocks());

describe('InventoryTable empty-row preset view', () => {
  it.each([
    ['Batches', 'showEmptyBatches', () => strings.INCLUDE_EMPTY_BATCHES],
    ['Nursery', 'showEmptyNurseries', () => strings.INCLUDE_NURSERIES_WITH_NO_INVENTORY],
    ['Species', 'showEmptySpecies', () => strings.INCLUDE_SPECIES_WITH_NO_INVENTORY],
  ] as const)('on %s, toggles %s between the preset and the default view', async (origin, key, presetLabel) => {
    const { user, setFilters } = renderTable(origin);

    await waitFor(() => expect(setFilters).toHaveBeenLastCalledWith(expect.objectContaining({ [key]: ['false'] })));

    await user.click(currentViewSelect());
    await user.click(screen.getByRole('option', { name: presetLabel() }));
    await waitFor(() => expect(setFilters).toHaveBeenLastCalledWith(expect.objectContaining({ [key]: ['true'] })));
    expect(currentViewSelect()).toHaveTextContent(presetLabel());

    await user.click(currentViewSelect());
    await user.click(screen.getByRole('option', { name: strings.DEFAULT }));
    await waitFor(() => expect(setFilters).toHaveBeenLastCalledWith(expect.objectContaining({ [key]: ['false'] })));
  });

  it('restores the preset after a reload', async () => {
    const first = renderTable('Batches');
    await first.user.click(currentViewSelect());
    await first.user.click(screen.getByRole('option', { name: strings.INCLUDE_EMPTY_BATCHES }));
    await waitFor(() =>
      expect(first.setFilters).toHaveBeenLastCalledWith(expect.objectContaining({ showEmptyBatches: ['true'] }))
    );
    first.unmount();

    const second = renderTable('Batches');
    expect(currentViewSelect()).toHaveTextContent(strings.INCLUDE_EMPTY_BATCHES);
    await waitFor(() =>
      expect(second.setFilters).toHaveBeenLastCalledWith(expect.objectContaining({ showEmptyBatches: ['true'] }))
    );
    expect(second.setFilters).not.toHaveBeenCalledWith(expect.objectContaining({ showEmptyBatches: ['false'] }));
  });

  it.each(['Batches', 'Nursery', 'Species'] as const)('on %s, no longer shows the separate filter button', (origin) => {
    renderTable(origin);

    expect(screen.queryByRole('button', { name: strings.FILTER })).not.toBeInTheDocument();
  });
});

describe('InventoryTable By Species nursery column filter', () => {
  it('shows species stocked at any of the selected nurseries', async () => {
    const { user, setFilters } = renderTable(
      'Species',
      [
        { id: '1', scientificName: 'Acacia koa', facilityInventories: 'Nursery A' },
        { id: '2', scientificName: 'Metrosideros polymorpha', facilityInventories: 'Nursery B\rNursery C' },
        { id: '3', scientificName: 'Sophora chrysophylla', facilityInventories: 'Nursery C' },
      ],
      [
        { key: 'scientificName', name: strings.SPECIES, type: 'string' },
        { key: 'facilityInventories', name: strings.NURSERY, type: 'string' },
      ]
    );

    await user.click(screen.getByRole('button', { name: 'Show/Hide filters' }));
    await user.click(screen.getByRole('combobox', { name: `Filter by ${strings.NURSERY}` }));
    const listbox = await screen.findByRole('listbox');
    await user.click(within(listbox).getByRole('option', { name: 'Nursery A' }));
    await user.click(within(listbox).getByRole('option', { name: 'Nursery B' }));
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('row', { name: /Sophora chrysophylla/ })).not.toBeInTheDocument());
    expect(screen.getByRole('row', { name: /Acacia koa/ })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Metrosideros polymorpha/ })).toBeInTheDocument();
    expect(setFilters).toHaveBeenLastCalledWith(expect.objectContaining({ facilityIds: [101, 102] }));
  });

  it('offers every nursery and clears the nursery scope when the filter is cleared', async () => {
    const { user, setFilters } = renderTable(
      'Species',
      [{ id: '1', scientificName: 'Acacia koa', facilityInventories: 'Nursery A' }],
      [
        { key: 'scientificName', name: strings.SPECIES, type: 'string' },
        { key: 'facilityInventories', name: strings.NURSERY, type: 'string' },
      ]
    );

    await user.click(screen.getByRole('button', { name: 'Show/Hide filters' }));
    await user.click(screen.getByRole('combobox', { name: `Filter by ${strings.NURSERY}` }));
    const listbox = await screen.findByRole('listbox');
    expect(
      within(listbox)
        .getAllByRole('option')
        .map((option) => option.textContent?.trim())
    ).toEqual(expect.arrayContaining(['Nursery A', 'Nursery B', 'Nursery C']));
    await user.click(within(listbox).getByRole('option', { name: 'Nursery C' }));
    await waitFor(() => expect(setFilters).toHaveBeenLastCalledWith(expect.objectContaining({ facilityIds: [103] })));

    await user.click(within(listbox).getByRole('option', { name: 'Nursery C' }));
    await waitFor(() =>
      expect(setFilters).toHaveBeenLastCalledWith(expect.objectContaining({ facilityIds: undefined }))
    );
  });
});
