import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw/http';

import PlantingDateRequestsTabContent from 'src/scenes/NurseryRouter/PlantingDateRequestsTabContent';
import strings from 'src/strings';
import { dialogTitled, mockGet, renderWithProviders, selectDropdownOption, server } from 'src/test-utils';

const buildRequest = (overrides: Record<string, unknown> = {}) => ({
  scheduledPlantingDate_plantingSeason_id: '1',
  scheduledPlantingDate_plantingSeason_name: 'Winter',
  scheduledPlantingDate_plantingSeason_plantingSite_id: '2',
  scheduledPlantingDate_plantingSeason_plantingSite_name: 'Abrewatia Hills',
  date: '2026-06-08',
  status: 'Pending',
  plantingDateRequestSpecies: [
    {
      species_id: '7',
      species_scientificName: 'Acacia koa',
      'quantity(raw)': '100',
    },
  ],
  ...overrides,
});

const buildRequestedSpecies = (speciesId: string, scientificName: string, quantity: number) => ({
  species_id: speciesId,
  species_scientificName: scientificName,
  'quantity(raw)': `${quantity}`,
});

const buildWithdrawal = (speciesId: string, quantity: number) => ({
  batchWithdrawals_batch_species_id: speciesId,
  'batchWithdrawals_readyQuantityWithdrawn(raw)': `${quantity}`,
});

/**
 * A request for three species, returned out of alphabetical order, where one species has nothing
 * withdrawn against it, one is partly withdrawn, and one is fully withdrawn.
 */
const buildPartiallyWithdrawnRequest = (overrides: Record<string, unknown> = {}) =>
  buildRequest({
    status: 'Partial',
    plantingDateRequestSpecies: [
      buildRequestedSpecies('9', 'Zanthoxylum dipetalum', 800),
      buildRequestedSpecies('7', 'Acacia koa', 1200),
      buildRequestedSpecies('8', 'Metrosideros polymorpha', 2500),
    ],
    withdrawals: [buildWithdrawal('9', 800), buildWithdrawal('8', 600)],
    ...overrides,
  });

/** Request bodies sent to the search endpoint, newest last. */
let searchRequests: Record<string, any>[];

/** Results the search endpoint returns for the `plantingDateRequests` prefix. */
let searchResults: Record<string, unknown>[];

const statusesOf = (body: Record<string, any>): string[] =>
  body.search.children.find((child: { field: string }) => child.field === 'status(raw)').values;

const openQuantities = async (user: UserEvent): Promise<HTMLElement> => {
  await user.click(await screen.findByRole('button', { name: strings.VIEW_QUANTITIES }));
  return dialogTitled(strings.REQUESTED_SPECIES);
};

/** The dialog row for a species, which is the only place its quantities are unambiguous. */
const speciesRow = (dialog: HTMLElement, scientificName: string): HTMLElement =>
  within(dialog).getByText(scientificName).parentElement as HTMLElement;

/**
 * What each column of a row reads, left to right. The quantities only mean anything paired with
 * the column they sit under, so a swapped Requested and Withdrawn has to be able to fail this.
 */
const columnsOf = (row: HTMLElement): (string | null)[] => Array.from(row.children).map((cell) => cell.textContent);

beforeEach(() => {
  searchRequests = [];
  searchResults = [buildRequest()];

  mockGet('/api/v1/tracking/sites', { sites: [{ id: 2, name: 'Abrewatia Hills' }] });
  mockGet('/api/v1/planting-seasons', {
    seasons: [{ id: 1, name: 'Winter', plantingSiteId: 2, status: 'Active', speciesTargets: [{ speciesId: 7 }] }],
  });
  mockGet('/api/v1/species', { species: [{ id: 7, scientificName: 'Acacia koa' }] });

  server.use(
    http.post('/api/v1/search', async ({ request }) => {
      const body = (await request.json()) as Record<string, any>;
      if (body.prefix !== 'plantingDateRequests') {
        return HttpResponse.json({ status: 'ok', results: [] });
      }
      searchRequests.push(body);
      return HttpResponse.json({ status: 'ok', results: searchResults });
    })
  );
});

describe('PlantingDateRequestsTabContent', () => {
  it('asks for the open statuses by default', async () => {
    renderWithProviders(<PlantingDateRequestsTabContent />);

    await waitFor(() => expect(searchRequests).not.toHaveLength(0));
    expect(statusesOf(searchRequests[0])).toEqual(['Pending', 'Partial']);
    expect(screen.getByDisplayValue(strings.ALL_OPEN)).toBeInTheDocument();
  });

  it('asks only for fulfilled requests when Fulfilled is selected', async () => {
    const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

    await waitFor(() => expect(searchRequests).not.toHaveLength(0));

    await selectDropdownOption(user, 'filter-status', strings.FULFILLED);

    await waitFor(() => expect(statusesOf(searchRequests.at(-1)!)).toEqual(['Fulfilled']));
  });

  it('labels a request with its status', async () => {
    searchResults = [
      buildRequest({ status: 'Pending' }),
      buildRequest({ date: '2026-06-11', status: 'Partial' }),
      buildRequest({ date: '2026-06-22', status: 'Fulfilled' }),
    ];

    renderWithProviders(<PlantingDateRequestsTabContent />);

    expect(await screen.findByText(strings.NEW)).toBeInTheDocument();
    expect(screen.getByText(strings.PARTIALLY_FULFILLED)).toBeInTheDocument();
    expect(screen.getByText(strings.FULFILLED)).toBeInTheDocument();
  });

  it('offers Withdraw on open requests but not on fulfilled ones', async () => {
    searchResults = [
      buildRequest({ status: 'Pending' }),
      buildRequest({ date: '2026-06-11', status: 'Partial' }),
      buildRequest({ date: '2026-06-22', status: 'Fulfilled' }),
    ];

    renderWithProviders(<PlantingDateRequestsTabContent />);

    await screen.findByText(strings.FULFILLED);
    expect(screen.getAllByRole('button', { name: strings.WITHDRAW })).toHaveLength(2);
  });

  it('tells the user which empty list they are looking at', async () => {
    searchResults = [];

    const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

    expect(await screen.findByText(strings.NO_PENDING_REQUESTS)).toBeInTheDocument();

    await selectDropdownOption(user, 'filter-status', strings.FULFILLED);

    expect(await screen.findByText(strings.NO_REQUESTS_FOR_SELECTED_FILTERS)).toBeInTheDocument();
  });

  describe('requested species dialog', () => {
    beforeEach(() => {
      searchResults = [buildPartiallyWithdrawnRequest()];
    });

    it('opens from the request and says which request it is for', async () => {
      const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

      await screen.findByRole('button', { name: strings.VIEW_QUANTITIES });
      expect(screen.queryByText(strings.REQUESTED_SPECIES)).not.toBeInTheDocument();

      const dialog = await openQuantities(user);

      expect(
        within(dialog).getByText(
          `${String(strings.formatString(strings.X_SPECIES, '3'))} · Jun 8, 2026 · Winter · Abrewatia Hills`
        )
      ).toBeInTheDocument();
    });

    it('lists the species alphabetically with their quantities and fulfillment', async () => {
      const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

      const dialog = await openQuantities(user);

      expect(
        within(dialog)
          .getAllByText(/^(Acacia koa|Metrosideros polymorpha|Zanthoxylum dipetalum)$/)
          .map((name) => name.textContent)
      ).toEqual(['Acacia koa', 'Metrosideros polymorpha', 'Zanthoxylum dipetalum']);

      expect(columnsOf(speciesRow(dialog, 'Acacia koa'))).toEqual(['Acacia koa', '1,200', '0', strings.NEW]);
      expect(columnsOf(speciesRow(dialog, 'Metrosideros polymorpha'))).toEqual([
        'Metrosideros polymorpha',
        '2,500',
        '600',
        strings.PARTIALLY_FULFILLED,
      ]);
      expect(columnsOf(speciesRow(dialog, 'Zanthoxylum dipetalum'))).toEqual([
        'Zanthoxylum dipetalum',
        '800',
        '800',
        strings.FULFILLED,
      ]);
    });

    it('totals the requested and withdrawn plants and says how many are left', async () => {
      const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

      const dialog = await openQuantities(user);
      const total = within(dialog).getByText(strings.TOTAL).parentElement as HTMLElement;

      expect(within(total).getByText('4,500')).toBeInTheDocument();
      expect(within(total).getByText('1,400')).toBeInTheDocument();
      expect(within(total).getByText(strings.formatString(strings.X_LEFT, '3,100') as string)).toBeInTheDocument();
      expect(within(total).getByText(strings.PARTIALLY_FULFILLED)).toBeInTheDocument();
    });

    it('offers a withdrawal for a request that is still open', async () => {
      const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

      const dialog = await openQuantities(user);

      expect(within(dialog).getByRole('button', { name: strings.WITHDRAW })).toBeInTheDocument();
    });

    it('offers no withdrawal and leaves nothing outstanding for a fulfilled request', async () => {
      searchResults = [
        buildPartiallyWithdrawnRequest({
          status: 'Fulfilled',
          withdrawals: [buildWithdrawal('7', 1200), buildWithdrawal('8', 2500), buildWithdrawal('9', 800)],
        }),
      ];

      const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

      const dialog = await openQuantities(user);
      const total = within(dialog).getByText(strings.TOTAL).parentElement as HTMLElement;

      expect(within(dialog).queryByRole('button', { name: strings.WITHDRAW })).not.toBeInTheDocument();
      expect(within(dialog).getByRole('button', { name: strings.CLOSE })).toBeInTheDocument();
      expect(within(total).queryByText(strings.formatString(strings.X_LEFT, '0') as string)).not.toBeInTheDocument();
      expect(within(total).getByText(strings.FULFILLED)).toBeInTheDocument();
    });
  });
});
