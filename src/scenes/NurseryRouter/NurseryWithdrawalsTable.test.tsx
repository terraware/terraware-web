import React from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw/http';

import { WithdrawalCustomPurposePayload } from 'src/queries/generated/withdrawalCustomPurposes';
import NurseryWithdrawalsTable from 'src/scenes/NurseryRouter/NurseryWithdrawalsTable';
import strings from 'src/strings';
import { mockGet, renderWithProviders, server } from 'src/test-utils';

const CUSTOM_PURPOSES_URL = '/api/v1/withdrawalCustomPurposes';
const SEARCH_URL = '/api/v1/search';

const SALE = { id: 7, name: 'Sale', isArchived: false };
const RESEARCH_ARCHIVED = { id: 8, name: 'Research', isArchived: true };

const otherLabel = (name: string) => strings.formatString(strings.OTHER_COLON_X, name) as string;

type SearchRow = Record<string, unknown>;
type SearchBody = { search: { children: { operation: string }[] } };

const buildWithdrawalRow = (overrides: SearchRow = {}): SearchRow => ({
  id: '1',
  withdrawnDate: '2026-03-14',
  'purpose(raw)': 'Dead',
  facility_name: 'North Nursery',
  'totalWithdrawn(raw)': '5',
  batchWithdrawals: [
    {
      batch_species_scientificName: 'Acacia koa',
      'activeGrowthQuantityWithdrawn(raw)': '0',
      'germinatingQuantityWithdrawn(raw)': '0',
      'hardeningOffQuantityWithdrawn(raw)': '0',
      'readyQuantityWithdrawn(raw)': '5',
    },
  ],
  ...overrides,
});

/**
 * Everything the withdrawals page loads on mount. Only the main search is interesting here; the
 * rest is the table's surrounding furniture (saved views, projects, filter values, row count).
 * Search bodies are kept parsed, so a test can read the latest one as often as it needs to.
 */
const mockWithdrawalsPage = ({
  customPurposes = [SALE, RESEARCH_ARCHIVED],
  results = [] as SearchRow[],
}: { customPurposes?: WithdrawalCustomPurposePayload[]; results?: SearchRow[] } = {}) => {
  const searches: SearchBody[] = [];
  const customPurposeUrls: string[] = [];

  server.use(
    http.post(SEARCH_URL, async ({ request }) => {
      searches.push((await request.json()) as SearchBody);
      return HttpResponse.json({ status: 'ok', results });
    }),
    http.post('/api/v1/search/values', () => HttpResponse.json({ status: 'ok', results: {} })),
    http.post('/api/v1/search/count', () => HttpResponse.json({ status: 'ok', count: results.length })),
    http.get(CUSTOM_PURPOSES_URL, ({ request }) => {
      customPurposeUrls.push(request.url);
      return HttpResponse.json({ status: 'ok', customPurposes });
    })
  );
  mockGet('/api/v1/projects', { projects: [] });
  mockGet('/api/v1/planting-seasons', { seasons: [] });
  mockGet('/api/v1/users/me', { user: {} });
  mockGet('/api/v1/users/me/preferences', { preferences: {} });
  mockGet('/api/v1/users/me/savedTableViews', { views: [] });

  return { searches, customPurposeUrls };
};

// The table persists its filters and view to localStorage, which the harness does not clear, so a
// filter one test applied would still be applied in the next.
beforeEach(() => {
  localStorage.clear();
});

const showFilters = async (user: UserEvent) => {
  await screen.findByRole('table');
  await user.click(screen.getByRole('button', { name: 'Show/Hide filters' }));
};

const openPurposeFilter = async (user: UserEvent) => {
  await showFilters(user);
  await user.click(screen.getByRole('combobox', { name: `Filter by ${strings.PURPOSE}` }));
  return screen.findByRole('listbox');
};

const chooseFilterOption = async (user: UserEvent, listbox: HTMLElement, label: string) => {
  await user.click(within(listbox).getByRole('option', { name: label }));
};

/** The condition the purpose filter contributes to the search, whatever else is being filtered. */
const purposeCondition = (searches: SearchBody[]) =>
  searches[searches.length - 1]?.search.children.find((child) => child.operation === 'or');

describe('NurseryWithdrawalsTable purpose filter', () => {
  it('offers every saved custom purpose, including archived ones', async () => {
    const { customPurposeUrls } = mockWithdrawalsPage();
    const { user } = renderWithProviders(<NurseryWithdrawalsTable />);

    const listbox = await openPurposeFilter(user);

    expect(within(listbox).getByRole('option', { name: otherLabel('Sale') })).toBeInTheDocument();
    // A purpose that was archived is gone from the withdrawal form but still sits on past
    // withdrawals, which would be unreachable if the history filter dropped it too.
    expect(within(listbox).getByRole('option', { name: otherLabel('Research') })).toBeInTheDocument();
    expect(new URL(customPurposeUrls[0]).searchParams.get('includeArchived')).toBe('true');

    expect(within(listbox).getByRole('option', { name: strings.DEAD })).toBeInTheDocument();
    expect(within(listbox).getByRole('option', { name: strings.OTHER })).toBeInTheDocument();
  });

  it('searches for the one custom purpose the user picked', async () => {
    const { searches } = mockWithdrawalsPage();
    const { user } = renderWithProviders(<NurseryWithdrawalsTable />);

    const listbox = await openPurposeFilter(user);
    await chooseFilterOption(user, listbox, otherLabel('Sale'));

    await waitFor(() =>
      expect(purposeCondition(searches)).toEqual({
        operation: 'or',
        children: [{ operation: 'field', field: 'customPurpose', type: 'Exact', values: ['Sale'] }],
      })
    );
  });

  it('leaves the custom purposes to the server when the user picks Other', async () => {
    const { searches } = mockWithdrawalsPage();
    const { user } = renderWithProviders(<NurseryWithdrawalsTable />);

    const listbox = await openPurposeFilter(user);
    await chooseFilterOption(user, listbox, strings.OTHER);

    // Other means every Other withdrawal, named or not, so the names must not narrow it.
    await waitFor(() =>
      expect(purposeCondition(searches)).toEqual({
        operation: 'or',
        children: [{ operation: 'field', field: 'purpose(raw)', type: 'Exact', values: ['Other'] }],
      })
    );
  });

  it('asks for withdrawals matching any of a mixed selection', async () => {
    const { searches } = mockWithdrawalsPage();
    const { user } = renderWithProviders(<NurseryWithdrawalsTable />);

    const listbox = await openPurposeFilter(user);
    await chooseFilterOption(user, listbox, strings.DEAD);
    await chooseFilterOption(user, listbox, otherLabel('Sale'));

    // One OR, not two conditions that would exclude each other.
    await waitFor(() =>
      expect(purposeCondition(searches)).toEqual({
        operation: 'or',
        children: [
          { operation: 'field', field: 'purpose(raw)', type: 'Exact', values: ['Dead'] },
          { operation: 'field', field: 'customPurpose', type: 'Exact', values: ['Sale'] },
        ],
      })
    );
  });
});

describe('NurseryWithdrawalsTable restoring a saved purpose filter', () => {
  const persistFilter = (values: string[]) =>
    localStorage.setItem('nursery-withdrawals-table_columnFilters', JSON.stringify([{ id: 'purpose', value: values }]));

  it('keeps searching for a saved custom purpose that this organization still has', async () => {
    persistFilter([`customPurpose:${SALE.id}`]);
    const { searches } = mockWithdrawalsPage();
    renderWithProviders(<NurseryWithdrawalsTable />);

    await screen.findByRole('table');

    await waitFor(() =>
      expect(purposeCondition(searches)).toEqual({
        operation: 'or',
        children: [{ operation: 'field', field: 'customPurpose', type: 'Exact', values: ['Sale'] }],
      })
    );
  });

  // The filter is stored per table, not per organization, and the server rejects a purpose it does
  // not know: every search and export would fail until the user noticed and cleared the filter.
  it('drops a saved custom purpose that this organization does not have', async () => {
    persistFilter(['customPurpose:999']);
    const { searches } = mockWithdrawalsPage();
    renderWithProviders(<NurseryWithdrawalsTable />);

    await screen.findByRole('table');

    await waitFor(() => expect(searches.length).toBeGreaterThan(0));
    await waitFor(() => expect(purposeCondition(searches)).toBeUndefined());
  });

  // Earlier versions of this page stored the translated label.
  it('still understands a built-in purpose saved under its label', async () => {
    persistFilter([strings.DEAD]);
    const { searches } = mockWithdrawalsPage();
    renderWithProviders(<NurseryWithdrawalsTable />);

    await screen.findByRole('table');

    await waitFor(() =>
      expect(purposeCondition(searches)).toEqual({
        operation: 'or',
        children: [{ operation: 'field', field: 'purpose(raw)', type: 'Exact', values: ['Dead'] }],
      })
    );
  });
});

describe('NurseryWithdrawalsTable purpose column', () => {
  it('names an Other withdrawal by the purpose it was given', async () => {
    mockWithdrawalsPage({
      results: [buildWithdrawalRow({ 'purpose(raw)': 'Other', customPurpose: 'Sale' })],
    });
    renderWithProviders(<NurseryWithdrawalsTable />);

    expect(await screen.findByText(otherLabel('Sale'))).toBeInTheDocument();
  });

  it('falls back to Other for a withdrawal that was never named', async () => {
    mockWithdrawalsPage({ results: [buildWithdrawalRow({ 'purpose(raw)': 'Other' })] });
    renderWithProviders(<NurseryWithdrawalsTable />);

    const row = await screen.findByRole('row', { name: /Acacia koa/ });
    expect(within(row).getByText(strings.OTHER)).toBeInTheDocument();
  });

  /**
   * The download is an anchor carrying a data: URI, so the file the user ends up with is whatever
   * that anchor holds when it is clicked.
   */
  it('names the purpose the same way in the exported file', async () => {
    const downloads: string[] = [];
    const click = rstest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      downloads.push(decodeURIComponent((this.getAttribute('href') ?? '').replace(/^data:[^,]*,/, '')));
    });

    try {
      mockWithdrawalsPage({
        results: [buildWithdrawalRow({ 'purpose(raw)': 'Other', customPurpose: 'Sale' })],
      });
      const { user } = renderWithProviders(<NurseryWithdrawalsTable />);

      await screen.findByRole('table');
      await user.click(screen.getByRole('button', { name: strings.EXPORT }));

      await waitFor(() => expect(downloads).toHaveLength(1));
      expect(downloads[0]).toContain(otherLabel('Sale'));
    } finally {
      click.mockRestore();
    }
  });
});
