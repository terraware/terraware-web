import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw/http';

import strings from 'src/strings';
import { buildOrganization, captureRequests, mockGet, mockPost, renderWithProviders, server } from 'src/test-utils';

import SeedsWithdrawalsTable from './SeedsWithdrawalsTable';

const ORG_ID = 1;

// Mirrors EXPORT_PAGE_SIZE in the component, which is what marks a request as part of an export.
const EXPORT_PAGE_SIZE = 1000;

// The search term is debounced before it reaches a request, so polling for one has to outlast
// that debounce on a loaded machine.
const WAIT_FOR_REQUEST_MS = 5000;

/** Cursors of the captured search requests whose criteria contain `term`, oldest first. */
const cursorsFor = async (requests: Request[], term: string): Promise<(string | undefined)[]> => {
  const bodies = (await Promise.all(requests.map((request) => request.clone().json()))) as {
    cursor?: string;
    search: unknown;
  }[];
  return bodies.filter((body) => JSON.stringify(body.search).includes(term)).map((body) => body.cursor);
};

type SeedWithdrawalSearchResult = Record<string, string>;

const buildSearchResult = (overrides: Partial<SeedWithdrawalSearchResult> = {}): SeedWithdrawalSearchResult => ({
  accession_id: '42',
  accession_accessionNumber: 'ACC-001',
  accession_species_scientificName: 'Acacia koa',
  accession_facility_name: 'Main Seed Bank',
  accession_project_name: 'Hawaii Restoration',
  date: '2026-03-14',
  destination: '',
  batch_facility_name: 'Kigali Nursery',
  notes: 'Shipped in two boxes',
  'purpose(raw)': 'Nursery',
  'quantity(raw)': '500',
  'units(raw)': 'Seeds',
  withdrawnBy_firstName: 'Ada',
  withdrawnBy_lastName: 'Lovelace',
  'estimatedCount(raw)': '480',
  'estimatedWeightQuantity(raw)': '12',
  'estimatedWeightUnits(raw)': 'Grams',
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

  it('shows the withdrawal columns in order, with the optional ones hidden', async () => {
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
      strings.WITHDRAWN_BY,
    ];
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(expectedHeaders.length);
    expectedHeaders.forEach((label, index) => {
      expect(within(headers[index]).getByText(label)).toBeVisible();
    });

    [strings.ESTIMATED_SEED_COUNT, strings.ESTIMATED_WEIGHT, strings.PROJECT, strings.NOTES].forEach((label) => {
      expect(screen.queryByRole('columnheader', { name: new RegExp(label) })).not.toBeInTheDocument();
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
      buildSearchResult({ 'purpose(raw)': 'Nursery', destination: '', batch_facility_name: 'Kigali Nursery' }),
      buildSearchResult({
        accession_accessionNumber: 'ACC-002',
        'purpose(raw)': 'Viability Testing',
        destination: 'Lab bench 3',
        batch_id: '',
        batch_facility_name: '',
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
  it('leaves the displayed page alone when exporting', async () => {
    const pageRows = [buildSearchResult()];
    const exportOnlyRow = buildSearchResult({ accession_accessionNumber: 'ACC-EXPORT-ONLY' });
    const exportRequestCount = { value: 0 };

    mockGet('/api/v1/projects', { projects: [] });
    mockPost('/api/v1/search/count', { count: 2 });
    mockPost('/api/v1/search/values', {
      results: {
        accession_species_scientificName: { values: ['Acacia koa'] },
        accession_facility_name: { values: ['Main Seed Bank'] },
        destination: { values: ['Kigali Nursery'] },
      },
    });
    server.use(
      http.post('/api/v1/search', async ({ request }) => {
        const body = (await request.json()) as { count?: number };
        const isExport = body.count === EXPORT_PAGE_SIZE;
        if (isExport) {
          exportRequestCount.value += 1;
        }
        return HttpResponse.json({
          status: 'ok',
          results: isExport ? [...pageRows, exportOnlyRow] : pageRows,
        });
      })
    );

    renderWithProviders(<SeedsWithdrawalsTable />, {
      organization: { selectedOrganization: buildOrganization({ id: ORG_ID }) },
    });

    expect(await screen.findByRole('cell', { name: 'ACC-001' })).toBeVisible();
    expect(screen.queryByText('ACC-EXPORT-ONLY')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: strings.EXPORT }));
    await waitFor(() => expect(exportRequestCount.value).toBe(1));

    expect(screen.queryByText('ACC-EXPORT-ONLY')).not.toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'ACC-001' })).toBeVisible();
  });
  it('gives the text columns a filter input, and leaves quantity unfiltered', async () => {
    renderTable([buildSearchResult()]);

    expect(await screen.findByRole('cell', { name: 'Acacia koa' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: /show.*hide filters/i }));

    expect(screen.getByPlaceholderText(new RegExp(strings.ACCESSION, 'i'))).toBeVisible();

    expect(screen.queryByPlaceholderText(new RegExp(strings.QUANTITY, 'i'))).not.toBeInTheDocument();
  });
  it('returns to the first page when the search term changes', async () => {
    mockGet('/api/v1/projects', { projects: [] });
    mockPost('/api/v1/search/count', { count: 250 });
    mockPost('/api/v1/search/values', {
      results: {
        accession_species_scientificName: { values: ['Acacia koa'] },
        accession_facility_name: { values: ['Main Seed Bank'] },
        destination: { values: ['Kigali Nursery'] },
      },
    });
    const requests = captureRequests('post', '/api/v1/search', { results: [buildSearchResult()] });

    renderWithProviders(<SeedsWithdrawalsTable />, {
      organization: { selectedOrganization: buildOrganization({ id: ORG_ID }) },
    });

    expect(await screen.findByRole('cell', { name: 'Acacia koa' })).toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: /go to next page/i }));
    await waitFor(async () => expect(await cursorsFor(requests, '')).toContain('100'), {
      timeout: WAIT_FOR_REQUEST_MS,
    });

    await userEvent.click(screen.getByRole('button', { name: /show.*hide search/i }));
    await userEvent.type(screen.getByPlaceholderText('Search'), 'koa');

    await waitFor(
      async () => {
        const cursors = await cursorsFor(requests, 'koa');
        expect(cursors.length).toBeGreaterThan(0);
        expect(Number(cursors[cursors.length - 1] ?? 0)).toBe(0);
      },
      { timeout: WAIT_FOR_REQUEST_MS }
    );
  });
  it('follows the response cursor so a capped export still gets every row', async () => {
    // The search service caps the export at one row per request and hands back a cursor.
    const exportCursors: (string | undefined)[] = [];
    server.use(
      http.post('/api/v1/search', async ({ request }) => {
        const body = (await request.json()) as { count?: number; cursor?: string };
        if (body.count !== EXPORT_PAGE_SIZE) {
          return HttpResponse.json({ status: 'ok', results: [buildSearchResult()] });
        }
        exportCursors.push(body.cursor);
        return body.cursor === '1'
          ? HttpResponse.json({
              status: 'ok',
              results: [buildSearchResult({ accession_accessionNumber: 'ACC-SECOND-PAGE' })],
            })
          : HttpResponse.json({
              status: 'ok',
              cursor: '1',
              results: [buildSearchResult({ accession_accessionNumber: 'ACC-FIRST-PAGE' })],
            });
      })
    );

    mockGet('/api/v1/projects', { projects: [] });
    mockPost('/api/v1/search/count', { count: 2 });
    mockPost('/api/v1/search/values', {
      results: {
        accession_species_scientificName: { values: ['Acacia koa'] },
        accession_facility_name: { values: ['Main Seed Bank'] },
        destination: { values: ['Kigali Nursery'] },
      },
    });

    renderWithProviders(<SeedsWithdrawalsTable />, {
      organization: { selectedOrganization: buildOrganization({ id: ORG_ID }) },
    });

    expect(await screen.findByRole('cell', { name: 'Acacia koa' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: strings.EXPORT }));

    await waitFor(() => expect(exportCursors).toEqual([undefined, '1']), { timeout: WAIT_FOR_REQUEST_MS });
  });
  it('shows who withdrew, and the estimates once unhidden', async () => {
    renderTable([buildSearchResult()]);

    expect(await screen.findByRole('cell', { name: 'Ada Lovelace' })).toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: /show.*hide columns/i }));
    await userEvent.click(await screen.findByRole('checkbox', { name: new RegExp(strings.ESTIMATED_SEED_COUNT) }));
    await userEvent.click(screen.getByRole('checkbox', { name: new RegExp(strings.ESTIMATED_WEIGHT) }));
    await userEvent.keyboard('{Escape}');

    expect(await screen.findByRole('cell', { name: '480' })).toBeVisible();
    expect(screen.getByRole('cell', { name: `12 ${strings.G}` })).toBeVisible();
  });
  it('links a viability withdrawal to its test and a nursery one to its batch', async () => {
    renderTable([
      buildSearchResult({
        'purpose(raw)': 'Viability Testing',
        viabilityTest_id: '77',
        destination: '',
        batch_id: '',
        batch_facility_name: '',
      }),
      buildSearchResult({
        accession_accessionNumber: 'ACC-002',
        'purpose(raw)': 'Nursery',
        destination: '',
        batch_id: '31',
        batch_facility_name: 'Kigali Nursery',
      }),
    ]);

    expect(await screen.findByRole('link', { name: strings.VIABILITY_TESTING })).toHaveAttribute(
      'href',
      '/accessions/42?viabilityTestId=77'
    );
    // Both links live on the purpose cell; the destination cell only names the nursery.
    expect(screen.getByRole('link', { name: `${strings.NURSERY}: Kigali Nursery` })).toHaveAttribute(
      'href',
      '/inventory/batch/31'
    );
    expect(screen.getByRole('cell', { name: 'Kigali Nursery' })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Kigali Nursery' })).not.toBeInTheDocument();
  });

  it('leaves the purpose as plain text when no batch was created', async () => {
    renderTable([
      buildSearchResult({
        'purpose(raw)': 'Other',
        destination: 'Elsewhere',
        batch_id: '',
        batch_facility_name: '',
      }),
    ]);

    expect(await screen.findByRole('cell', { name: 'Elsewhere' })).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Elsewhere' })).not.toBeInTheDocument();
  });
});
