import React from 'react';

import { screen } from '@testing-library/react';

import CachedUserService from 'src/services/CachedUserService';
import strings from 'src/strings';
import { buildOrganization, renderWithProviders } from 'src/test-utils';
import { SearchResponseElementWithId } from 'src/types/Search';

import AccessionsTable from './AccessionsTable';

const ORG_ID = 1;

const enableBulkWithdraw = () => CachedUserService.setUserOrgPreferences(ORG_ID, { bulkAccessionWithdraw: true });

afterEach(() => CachedUserService.setUserOrgPreferences(ORG_ID, {}));

const buildRow = (overrides: Partial<Record<string, unknown>> = {}): SearchResponseElementWithId =>
  ({
    id: '1',
    accessionNumber: 'ACC-001',
    speciesName: 'Acacia koa',
    species_id: 10,
    state: 'In Storage',
    ...overrides,
  }) as unknown as SearchResponseElementWithId;

const renderTable = (searchResults: SearchResponseElementWithId[]) =>
  renderWithProviders(<AccessionsTable searchResults={searchResults} />, {
    organization: { selectedOrganization: buildOrganization({ id: ORG_ID }) },
  });

describe('AccessionsTable bulk withdrawal', () => {
  it('shows no selection when the bulk-withdraw feature is off', () => {
    renderTable([buildRow({ id: '1' }), buildRow({ id: '2', accessionNumber: 'ACC-002' })]);

    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: strings.WITHDRAW })).not.toBeInTheDocument();
  });

  it('enables withdrawal and banners the species when same-species rows are selected', async () => {
    enableBulkWithdraw();
    const { user } = renderTable([
      buildRow({ id: '1', accessionNumber: 'ACC-001', species_id: 10, speciesName: 'Acacia koa' }),
      buildRow({ id: '2', accessionNumber: 'ACC-002', species_id: 10, speciesName: 'Acacia koa' }),
    ]);

    await user.click(screen.getByRole('checkbox', { name: 'Toggle select all' }));

    expect(
      screen.getByText(strings.formatString(strings.BULK_WITHDRAW_SPECIES_BANNER, 'Acacia koa').toString())
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.WITHDRAW })).toBeEnabled();
  });

  it('blocks withdrawal when the selected rows are of different species', async () => {
    enableBulkWithdraw();
    const { user } = renderTable([
      buildRow({ id: '1', accessionNumber: 'ACC-001', species_id: 10, speciesName: 'Acacia koa' }),
      buildRow({ id: '2', accessionNumber: 'ACC-002', species_id: 20, speciesName: 'Metrosideros polymorpha' }),
    ]);

    await user.click(screen.getByRole('checkbox', { name: 'Toggle select all' }));

    expect(screen.getByRole('button', { name: strings.WITHDRAW })).toBeDisabled();
    expect(
      screen.queryByText(strings.formatString(strings.BULK_WITHDRAW_SPECIES_BANNER, 'Acacia koa').toString())
    ).not.toBeInTheDocument();
  });
});
