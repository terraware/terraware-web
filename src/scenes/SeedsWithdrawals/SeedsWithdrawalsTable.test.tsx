import React from 'react';

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import strings from 'src/strings';
import { buildOrganization, mockGet, mockPost, renderWithProviders } from 'src/test-utils';

import SeedsWithdrawalsTable from './SeedsWithdrawalsTable';

const ORG_ID = 1;

type SeedWithdrawalSearchResult = Record<string, string>;

const buildSearchResult = (overrides: Partial<SeedWithdrawalSearchResult> = {}): SeedWithdrawalSearchResult => ({
  accession_id: '42',
  accession_accessionNumber: 'ACC-001',
  accession_species_scientificName: 'Acacia koa',
  accession_facility_name: 'Main Seed Bank',
  accession_project_name: 'Hawaii Restoration',
  date: '2026-03-14',
  destination: 'Kigali Nursery',
  notes: 'Shipped in two boxes',
  'purpose(raw)': 'Nursery',
  'quantity(raw)': '500',
  'units(raw)': 'Seeds',
  ...overrides,
});

const renderTable = (results: SeedWithdrawalSearchResult[]) => {
  mockGet('/api/v1/projects', { projects: [] });
  mockPost('/api/v1/search', { results });
  mockPost('/api/v1/search/count', { count: results.length });
  mockPost('/api/v1/search/values', {
    results: {
      accession_species_scientificName: { values: ['Acacia koa'] },
      accession_facility_name: { values: ['Main Seed Bank'] },
      destination: { values: ['Kigali Nursery'] },
    },
  });

  return renderWithProviders(<SeedsWithdrawalsTable />, {
    organization: { selectedOrganization: buildOrganization({ id: ORG_ID }) },
  });
};

describe('SeedsWithdrawalsTable', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('shows the withdrawal columns in order, with project and notes hidden', async () => {
    renderTable([buildSearchResult()]);

    expect(await screen.findByRole('cell', { name: 'Acacia koa' })).toBeVisible();

    const expectedHeaders = [
      strings.DATE,
      strings.ACCESSION,
      strings.SPECIES,
      strings.PURPOSE,
      strings.FROM_SEED_BANK,
      strings.QUANTITY,
      strings.DESTINATION,
    ];
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(expectedHeaders.length);
    expectedHeaders.forEach((label, index) => {
      expect(within(headers[index]).getByText(label)).toBeVisible();
    });

    expect(screen.queryByText('Hawaii Restoration')).not.toBeInTheDocument();
    expect(screen.queryByText('Shipped in two boxes')).not.toBeInTheDocument();
  });

  it('links the date and the accession number to the accession', async () => {
    renderTable([buildSearchResult()]);

    expect(await screen.findByRole('link', { name: '2026-03-14' })).toHaveAttribute('href', '/accessions/42');
    expect(screen.getByRole('link', { name: 'ACC-001' })).toHaveAttribute('href', '/accessions/42');
  });

  it('names the destination nursery alongside the purpose, and only for nursery withdrawals', async () => {
    renderTable([
      buildSearchResult({ 'purpose(raw)': 'Nursery', destination: 'Kigali Nursery' }),
      buildSearchResult({
        accession_accessionNumber: 'ACC-002',
        'purpose(raw)': 'Viability Testing',
        destination: 'Lab bench 3',
      }),
    ]);

    expect(await screen.findByRole('cell', { name: `${strings.NURSERY}: Kigali Nursery` })).toBeVisible();
    expect(screen.getByRole('cell', { name: strings.VIABILITY_TESTING })).toBeVisible();
  });

  it('shows the recorded quantity with the unit it was withdrawn in', async () => {
    renderTable([
      buildSearchResult({ 'quantity(raw)': '500', 'units(raw)': 'Seeds' }),
      buildSearchResult({
        accession_accessionNumber: 'ACC-002',
        'quantity(raw)': '12',
        'units(raw)': 'Grams',
      }),
    ]);

    expect(await screen.findByRole('cell', { name: `500 ${strings.CT}` })).toBeVisible();
    expect(screen.getByRole('cell', { name: `12 ${strings.G}` })).toBeVisible();
  });

  it('shows the empty state when there are no withdrawals', async () => {
    renderTable([]);

    expect(await screen.findByText('No records to display')).toBeVisible();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
  it('gives the text columns a filter input, and leaves quantity unfiltered', async () => {
    renderTable([buildSearchResult()]);

    expect(await screen.findByRole('cell', { name: 'Acacia koa' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: /show.*hide filters/i }));

    expect(screen.getByPlaceholderText(new RegExp(strings.ACCESSION, 'i'))).toBeVisible();

    expect(screen.queryByPlaceholderText(new RegExp(strings.QUANTITY, 'i'))).not.toBeInTheDocument();
  });
});
