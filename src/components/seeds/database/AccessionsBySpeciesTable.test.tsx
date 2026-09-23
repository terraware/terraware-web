import React from 'react';

import { screen } from '@testing-library/react';

import strings from 'src/strings';
import { buildOrganization, mockGet, renderWithProviders } from 'src/test-utils';
import { SearchResponseElementWithId } from 'src/types/Search';

import AccessionsBySpeciesTable from './AccessionsBySpeciesTable';

const ORG_ID = 1;

const buildRow = (overrides: Partial<Record<string, unknown>> = {}): SearchResponseElementWithId =>
  ({
    id: '1',
    accessionNumber: 'ACC-001',
    speciesName: 'Acacia koa',
    species_id: 10,
    state: 'In Storage',
    'estimatedCount(raw)': '100',
    ...overrides,
  }) as unknown as SearchResponseElementWithId;

const renderTable = (searchResults: SearchResponseElementWithId[], role: 'Owner' | 'Contributor' = 'Owner') => {
  // The by-species table pulls the project list on mount; keep the request handled.
  mockGet('/api/v1/projects', { projects: [] });
  return renderWithProviders(<AccessionsBySpeciesTable searchResults={searchResults} />, {
    organization: { selectedOrganization: buildOrganization({ id: ORG_ID, role }) },
  });
};

describe('AccessionsBySpeciesTable bulk withdrawal', () => {
  it('shows no selection for a contributor', () => {
    // Contributors cannot edit accessions, so the withdrawal entry point must stay hidden.
    renderTable([buildRow({ id: '1', species_id: 10, speciesName: 'Acacia koa' })], 'Contributor');

    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: strings.WITHDRAW })).not.toBeInTheDocument();
  });

  it('enables withdrawal when exactly one species row is selected', async () => {
    const { user } = renderTable([
      buildRow({ id: '1', species_id: 10, speciesName: 'Acacia koa' }),
      buildRow({ id: '2', species_id: 20, speciesName: 'Metrosideros polymorpha' }),
    ]);

    const rowCheckboxes = screen.getAllByRole('checkbox', { name: 'Toggle select row' });
    await user.click(rowCheckboxes[0]);

    expect(
      screen.getByText(strings.formatString(strings.BULK_WITHDRAW_SPECIES_BANNER, 'Acacia koa').toString())
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.WITHDRAW })).toBeEnabled();
  });

  it('blocks withdrawal when two species rows are selected', async () => {
    const { user } = renderTable([
      buildRow({ id: '1', species_id: 10, speciesName: 'Acacia koa' }),
      buildRow({ id: '2', species_id: 20, speciesName: 'Metrosideros polymorpha' }),
    ]);

    await user.click(screen.getByRole('checkbox', { name: 'Toggle select all' }));

    expect(screen.getByRole('button', { name: strings.WITHDRAW })).toBeDisabled();
    expect(
      screen.queryByText(strings.formatString(strings.BULK_WITHDRAW_SPECIES_BANNER, 'Acacia koa').toString())
    ).not.toBeInTheDocument();
  });

  it('disables the checkbox for a species whose accessions are all awaiting check-in', () => {
    renderTable([buildRow({ id: '1', species_id: 10, speciesName: 'Acacia koa', state: 'Awaiting Check-In' })]);

    // The species has no withdrawable (checked-in) accessions, so its row can't be selected.
    expect(screen.getByRole('checkbox', { name: 'Toggle select row' })).toBeDisabled();
  });

  it('disables other species rows once one species row is selected', async () => {
    const { user } = renderTable([
      buildRow({ id: '1', species_id: 10, speciesName: 'Acacia koa' }),
      buildRow({ id: '2', species_id: 20, speciesName: 'Metrosideros polymorpha' }),
    ]);

    const rowCheckboxes = screen.getAllByRole('checkbox', { name: 'Toggle select row' });
    await user.click(rowCheckboxes[0]);

    const after = screen.getAllByRole('checkbox', { name: 'Toggle select row' });
    // Only one species can be withdrawn at a time, so the other species row is disabled.
    expect(after[1]).toBeDisabled();
  });
});
