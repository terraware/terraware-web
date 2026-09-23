import React from 'react';

import { screen } from '@testing-library/react';

import strings from 'src/strings';
import { buildOrganization, renderWithProviders } from 'src/test-utils';
import { SearchResponseElementWithId } from 'src/types/Search';

import AccessionsTable from './AccessionsTable';

const ORG_ID = 1;

const buildRow = (overrides: Partial<Record<string, unknown>> = {}): SearchResponseElementWithId =>
  ({
    id: '1',
    accessionNumber: 'ACC-001',
    speciesName: 'Acacia koa',
    species_id: 10,
    state: 'In Storage',
    ...overrides,
  }) as unknown as SearchResponseElementWithId;

const renderTable = (searchResults: SearchResponseElementWithId[], role: 'Owner' | 'Contributor' = 'Owner') =>
  renderWithProviders(<AccessionsTable searchResults={searchResults} />, {
    organization: { selectedOrganization: buildOrganization({ id: ORG_ID, role }) },
  });

describe('AccessionsTable bulk withdrawal', () => {
  it('shows no selection for a contributor', () => {
    // Contributors cannot edit accessions, so the withdrawal entry point must stay hidden.
    renderTable([buildRow({ id: '1' }), buildRow({ id: '2', accessionNumber: 'ACC-002' })], 'Contributor');

    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(screen.queryByRole('button', { name: strings.WITHDRAW })).not.toBeInTheDocument();
  });

  it('shows the species banner and enables the Withdraw button when same-species rows are selected', async () => {
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

  it('blocks withdrawal for different legacy species without species IDs', async () => {
    const { user } = renderTable([
      buildRow({ id: '1', accessionNumber: 'ACC-001', species_id: undefined, speciesName: 'Acacia koa' }),
      buildRow({
        id: '2',
        accessionNumber: 'ACC-002',
        species_id: undefined,
        speciesName: 'Metrosideros polymorpha',
      }),
    ]);

    await user.click(screen.getByRole('checkbox', { name: 'Toggle select all' }));

    expect(screen.getByRole('button', { name: strings.WITHDRAW })).toBeDisabled();
  });

  it('disables the checkbox for an accession that is not yet checked in', () => {
    renderTable([
      buildRow({ id: '1', accessionNumber: 'ACC-001', species_id: 10, speciesName: 'Acacia koa', state: 'In Storage' }),
      buildRow({
        id: '2',
        accessionNumber: 'ACC-002',
        species_id: 10,
        speciesName: 'Acacia koa',
        state: 'Awaiting Check-In',
      }),
    ]);

    // Awaiting Check-In accessions can't be withdrawn, so their checkbox is disabled up front.
    const rowCheckboxes = screen.getAllByRole('checkbox', { name: 'Toggle select row' });
    expect(rowCheckboxes[0]).toBeEnabled();
    expect(rowCheckboxes[1]).toBeDisabled();
  });

  it('disables different-species checkboxes once a row is selected', async () => {
    const { user } = renderTable([
      buildRow({ id: '1', accessionNumber: 'ACC-001', species_id: 10, speciesName: 'Acacia koa' }),
      buildRow({ id: '2', accessionNumber: 'ACC-002', species_id: 10, speciesName: 'Acacia koa' }),
      buildRow({ id: '3', accessionNumber: 'ACC-003', species_id: 20, speciesName: 'Metrosideros polymorpha' }),
    ]);

    const rowCheckboxes = screen.getAllByRole('checkbox', { name: 'Toggle select row' });
    await user.click(rowCheckboxes[0]);

    const after = screen.getAllByRole('checkbox', { name: 'Toggle select row' });
    // Same-species row stays selectable; the different-species row is disabled.
    expect(after[1]).toBeEnabled();
    expect(after[2]).toBeDisabled();
  });

  it('disables a different legacy species without a species ID once a row is selected', async () => {
    const { user } = renderTable([
      buildRow({ id: '1', accessionNumber: 'ACC-001', species_id: undefined, speciesName: 'Acacia koa' }),
      buildRow({
        id: '2',
        accessionNumber: 'ACC-002',
        species_id: undefined,
        speciesName: 'Metrosideros polymorpha',
      }),
    ]);

    const rowCheckboxes = screen.getAllByRole('checkbox', { name: 'Toggle select row' });
    await user.click(rowCheckboxes[0]);

    expect(screen.getAllByRole('checkbox', { name: 'Toggle select row' })[1]).toBeDisabled();
  });

  it('keeps the species banner while selecting additional same-species rows', async () => {
    const { user } = renderTable([
      buildRow({ id: '1', accessionNumber: 'ACC-001', species_id: 10, speciesName: 'Acacia koa' }),
      buildRow({ id: '2', accessionNumber: 'ACC-002', species_id: 10, speciesName: 'Acacia koa' }),
    ]);

    const bannerText = strings.formatString(strings.BULK_WITHDRAW_SPECIES_BANNER, 'Acacia koa').toString();
    const rowCheckboxes = screen.getAllByRole('checkbox', { name: 'Toggle select row' });

    await user.click(rowCheckboxes[0]);
    expect(screen.getByText(bannerText)).toBeInTheDocument();

    await user.click(rowCheckboxes[1]);
    // The banner persists as more same-species rows are added, not only after the first.
    expect(screen.getByText(bannerText)).toBeInTheDocument();
  });
});
