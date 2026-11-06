import React from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';

import strings from 'src/strings';
import {
  buildFacility,
  buildOrganization,
  buildSpecies,
  buildUser,
  captureRequests,
  mockGet,
  renderWithProviders,
} from 'src/test-utils';

import { getNurseryDeleteSpeciesIds, getSpeciesDeleteFacilityIds } from './FilterUtils';
import InventoryTable from './InventoryTable';

const species = [
  buildSpecies({ id: 11, scientificName: 'Acacia koa' }),
  buildSpecies({ id: 22, scientificName: 'Metrosideros polymorpha' }),
];

describe('nursery deletion species scope', () => {
  it('restricts deletion to the species selected in the visible column filter', () => {
    expect(getNurseryDeleteSpeciesIds('Acacia koa', species)).toEqual([11]);
  });

  it('intersects the column filter with server-side species filters', () => {
    expect(getNurseryDeleteSpeciesIds(['Acacia koa', 'Metrosideros polymorpha'], species, [22])).toEqual([22]);
    expect(getNurseryDeleteSpeciesIds('Acacia koa', species, [22])).toEqual([]);
  });

  it.each([undefined, null, '', []])(
    'preserves the server-side filter when the column filter is cleared (%s)',
    (value) => {
      expect(getNurseryDeleteSpeciesIds(value, species, [22])).toEqual([22]);
      expect(getNurseryDeleteSpeciesIds(value, species)).toBeUndefined();
      expect(getNurseryDeleteSpeciesIds(value, species, [])).toBeUndefined();
    }
  );

  it('does not broaden deletion when a selected species cannot be resolved', () => {
    expect(getNurseryDeleteSpeciesIds('Unknown species', species)).toEqual([]);
    expect(getNurseryDeleteSpeciesIds('Acacia koa', [])).toEqual([]);
  });

  it('resolves an active column filter even when the server-side filter is empty', () => {
    expect(getNurseryDeleteSpeciesIds('Acacia koa', species, [])).toEqual([11]);
  });
});

describe('species deletion nursery scope', () => {
  const organization = buildOrganization({
    facilities: [
      buildFacility({ id: 101, name: 'Nursery A' }),
      buildFacility({ id: 102, name: 'Nursery B' }),
      buildFacility({ id: 103, name: 'Nursery C' }),
    ],
  });

  it('restricts deletion to the nurseries selected in the column filter', () => {
    expect(getSpeciesDeleteFacilityIds(['Nursery A', 'Nursery B'], organization)).toEqual([101, 102]);
  });

  it('intersects the column filter with server-side nursery filters', () => {
    expect(getSpeciesDeleteFacilityIds(['Nursery A', 'Nursery B'], organization, [102, 103])).toEqual([102]);
  });

  it.each([undefined, null, '', []])(
    'preserves the server-side filter when the column filter is cleared (%s)',
    (value) => {
      expect(getSpeciesDeleteFacilityIds(value, organization, [103])).toEqual([103]);
      expect(getSpeciesDeleteFacilityIds(value, organization)).toBeUndefined();
    }
  );

  it('does not broaden deletion when a selected nursery cannot be resolved', () => {
    expect(getSpeciesDeleteFacilityIds(['Unknown nursery'], organization)).toEqual([]);
  });
});

describe('nursery deletion with the sticky Species column filter', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    rstest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    mockGet('/api/v1/species', { species });
    mockGet('/api/v1/projects', { projects: [] });
    mockGet('/api/v1/users/me', { user: buildUser() });
    mockGet('/api/v1/users/me/preferences', { preferences: {} });
  });

  afterEach(() => rstest.restoreAllMocks());

  it.each(['resolved', 'unresolved', 'empty', 'failed'] as const)(
    'uses the visible multi-select filter when the lookup is %s',
    async (scenario) => {
      const lookups = captureRequests(
        'post',
        '/api/v1/search',
        { results: scenario === 'empty' ? [] : [{ id: '501' }] },
        scenario === 'failed' ? 500 : 200
      );
      const deletes = captureRequests('delete', '/api/v1/nursery/batches/:id');
      const { user, store } = renderWithProviders(
        <InventoryTable
          origin='Nursery'
          results={[
            {
              facility_id: '105',
              facility_name: 'Nursery105',
              facilityInventories: 'Acacia koa\rMetrosideros polymorpha',
              'totalQuantity(raw)': 0,
              'germinatingQuantity(raw)': 0,
            },
          ]}
          columns={[
            { key: 'facility_name', name: strings.NURSERY, type: 'string' },
            { key: 'facilityInventories', name: strings.SPECIES, type: 'string' },
          ]}
          nurserySpecies={scenario === 'unresolved' ? [] : species}
          filters={{}}
          setFilters={() => undefined}
          temporalSearchValue=''
          setTemporalSearchValue={() => undefined}
        />,
        { organization: { selectedOrganization: buildOrganization({ id: 7 }) } }
      );

      const rowCheckbox = () => within(screen.getByRole('row', { name: /Nursery105/ })).getByRole('checkbox');
      await user.click(rowCheckbox());
      expect(rowCheckbox()).toBeChecked();
      await user.click(screen.getByRole('button', { name: 'Show/Hide filters' }));
      await user.click(screen.getByRole('combobox', { name: `Filter by ${strings.SPECIES}` }));
      await user.click(screen.getByRole('option', { name: 'Acacia koa' }));
      await user.keyboard('{Escape}');
      await waitFor(() => expect(rowCheckbox()).not.toBeChecked());

      await user.click(rowCheckbox());
      await user.click(screen.getByRole('button', { name: strings.DELETE }));
      const dialog = await screen.findByRole('dialog', { name: strings.DELETE_SEEDLINGS_BATCHES });
      await user.click(within(dialog).getByRole('button', { name: strings.DELETE }));

      if (scenario === 'failed') {
        await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));
        expect(dialog).toBeInTheDocument();
      } else {
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      }
      if (scenario === 'unresolved') {
        expect(lookups).toHaveLength(0);
      } else {
        await waitFor(() => expect(lookups).toHaveLength(scenario === 'resolved' ? 2 : 1));
        for (const request of lookups) {
          expect(await request.json()).toMatchObject({
            prefix: 'batches',
            search: {
              operation: 'and',
              children: [
                { field: 'facility_organization_id', values: ['7'] },
                { field: 'facility_id', values: ['105'] },
                { field: 'species_id', values: ['11'] },
              ],
            },
          });
        }
      }
      expect(deletes.map((request) => new URL(request.url).pathname)).toEqual(
        scenario === 'resolved' ? ['/api/v1/nursery/batches/501'] : []
      );
    }
  );
});
