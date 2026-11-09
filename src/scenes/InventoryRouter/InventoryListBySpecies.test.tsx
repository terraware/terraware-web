import React from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import strings from 'src/strings';
import {
  buildFacility,
  buildOrganization,
  buildSpecies,
  buildUser,
  mockGet,
  mockPost,
  renderWithProviders,
  server,
} from 'src/test-utils';

import InventoryListBySpecies from './InventoryListBySpecies';

const orgWideResult = {
  id: '11',
  scientificName: 'Acacia koa',
  inventory: {
    'germinatingQuantity(raw)': '3',
    'hardeningOffQuantity(raw)': '0',
    'activeGrowthQuantity(raw)': '0',
    'readyQuantity(raw)': '12',
    'totalQuantity(raw)': '15',
    facilityInventories: [
      { facility_id: '101', facility_name: 'Nursery A' },
      { facility_id: '102', facility_name: 'Nursery B' },
    ],
  },
};

const nurseryAResult = {
  id: '11',
  scientificName: 'Acacia koa',
  facilityInventories: [
    {
      facility_id: '101',
      facility_name: 'Nursery A',
      'germinatingQuantity(raw)': '0',
      'hardeningOffQuantity(raw)': '0',
      'activeGrowthQuantity(raw)': '0',
      'readyQuantity(raw)': '5',
      'totalQuantity(raw)': '5',
    },
  ],
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
  mockPost('/api/v1/search/count', { count: 1 });
  server.use(
    http.post('/api/v1/search', async ({ request }) => {
      const body = (await request.json()) as { filters?: unknown[] };
      return HttpResponse.json({ status: 'ok', results: body.filters?.length ? [nurseryAResult] : [orgWideResult] });
    })
  );
});

afterEach(() => rstest.restoreAllMocks());

const renderList = () =>
  renderWithProviders(<InventoryListBySpecies />, {
    organization: {
      selectedOrganization: buildOrganization({
        id: 7,
        facilities: [buildFacility({ id: 101, name: 'Nursery A' }), buildFacility({ id: 102, name: 'Nursery B' })],
      }),
    },
  });

const selectNurseryFilter = async (user: ReturnType<typeof renderList>['user'], nurseryName: string) => {
  await user.click(screen.getByRole('button', { name: 'Show/Hide filters' }));
  await user.click(screen.getByRole('combobox', { name: `Filter by ${strings.NURSERIES}` }));
  const listbox = await screen.findByRole('listbox');
  await user.click(within(listbox).getByRole('option', { name: nurseryName }));
  await user.keyboard('{Escape}');
};

describe('InventoryListBySpecies', () => {
  it('keeps a species stocked at the selected nursery that has no germinating seedlings', async () => {
    const { user } = renderList();

    const acaciaRow = () => screen.getByRole('row', { name: /Acacia koa/ });
    await waitFor(() => expect(within(acaciaRow()).getByRole('cell', { name: '15' })).toBeInTheDocument());

    await selectNurseryFilter(user, 'Nursery A');

    await waitFor(() => expect(within(acaciaRow()).queryByRole('cell', { name: '15' })).not.toBeInTheDocument());
    expect(within(acaciaRow()).getAllByRole('cell', { name: '5' }).length).toBeGreaterThan(0);
  });

  it('shows species with no inventory at the selected nursery only in the include-empty view', async () => {
    server.use(
      http.post('/api/v1/search', async ({ request }) => {
        const body = (await request.json()) as { filters?: unknown[] };
        const results = body.filters?.length
          ? [nurseryAResult, { id: '12', scientificName: 'Metrosideros polymorpha', facilityInventories: [] }]
          : [orgWideResult, { id: '12', scientificName: 'Metrosideros polymorpha' }];
        return HttpResponse.json({ status: 'ok', results });
      })
    );
    const { user } = renderList();
    const currentViewSelect = () => screen.getByRole('combobox', { name: new RegExp(strings.CURRENT_VIEW) });

    await screen.findByRole('row', { name: /Acacia koa/ });
    await user.click(currentViewSelect());
    await user.click(screen.getByRole('option', { name: strings.INCLUDE_SPECIES_WITH_NO_INVENTORY }));
    await selectNurseryFilter(user, 'Nursery A');

    await waitFor(() =>
      expect(
        within(screen.getByRole('row', { name: /Acacia koa/ })).queryByRole('cell', { name: '15' })
      ).not.toBeInTheDocument()
    );
    expect(await screen.findByRole('row', { name: /Metrosideros polymorpha/ })).toBeInTheDocument();

    await user.click(currentViewSelect());
    await user.click(screen.getByRole('option', { name: strings.DEFAULT }));

    await waitFor(() => expect(screen.queryByRole('row', { name: /Metrosideros polymorpha/ })).not.toBeInTheDocument());
    expect(screen.getByRole('row', { name: /Acacia koa/ })).toBeInTheDocument();
  });
});
