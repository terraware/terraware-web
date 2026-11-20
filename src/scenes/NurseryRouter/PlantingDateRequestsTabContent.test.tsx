import React from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw/http';

import PlantingDateRequestsTabContent from 'src/scenes/NurseryRouter/PlantingDateRequestsTabContent';
import strings from 'src/strings';
import { dialogTitled, mockGet, renderWithProviders, selectDropdownOption, server } from 'src/test-utils';

/** Which layout the tab renders: the dialog on desktop and tablet, the bottom sheet on mobile. */
let device: 'desktop' | 'tablet' | 'mobile';
rstest.mock('src/utils/useDeviceInfo', () => ({
  __esModule: true,
  default: () => ({
    isDesktop: device === 'desktop',
    isTablet: device === 'tablet',
    isMobile: device === 'mobile',
  }),
}));

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
  return dialogTitled(strings.VIEW_SPECIES_QUANTITIES);
};

/** The dialog row for a species, which is the only place its quantities are unambiguous. */
const speciesRow = (dialog: HTMLElement, scientificName: string): HTMLElement =>
  within(dialog).getByText(scientificName).parentElement as HTMLElement;

/**
 * What each column of a row reads, left to right. The quantities only mean anything paired with
 * the column they sit under, so a swapped Requested and Withdrawn has to be able to fail this.
 */
const columnsOf = (row: HTMLElement): (string | null)[] => Array.from(row.children).map((cell) => cell.textContent);

/** Where an element sits in document order, for asserting which block of the card it landed in. */
const domOrder = (element: Element): number => Array.from(document.querySelectorAll('*')).indexOf(element);

beforeEach(() => {
  device = 'desktop';
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

  it('offers Withdraw on every request, fulfilled ones included', async () => {
    searchResults = [
      buildRequest({ status: 'Pending' }),
      buildRequest({ date: '2026-06-11', status: 'Partial' }),
      buildRequest({ date: '2026-06-22', status: 'Fulfilled' }),
    ];

    renderWithProviders(<PlantingDateRequestsTabContent />);

    await screen.findByText(strings.FULFILLED);
    expect(screen.getAllByRole('button', { name: strings.WITHDRAW })).toHaveLength(3);
  });

  it('lists the species alphabetically, trimmed to what the width fits', async () => {
    const names = ['Sophora chrysophylla', 'Acacia koa', 'Metrosideros polymorpha', 'Dodonaea viscosa'];
    searchResults = [
      buildRequest({
        plantingDateRequestSpecies: names.map((name, index) => buildRequestedSpecies(`${index + 1}`, name, 10)),
      }),
    ];

    renderWithProviders(<PlantingDateRequestsTabContent />);

    // Six names fit on a desktop, so all four show and nothing is held back.
    expect(await screen.findByText(names.toSorted((a, b) => a.localeCompare(b)).join(', '))).toBeInTheDocument();
  });

  it('holds the overflowing names behind a count once the width runs out', async () => {
    const names = ['Sophora chrysophylla', 'Acacia koa', 'Metrosideros polymorpha', 'Dodonaea viscosa'];
    device = 'mobile';
    searchResults = [
      buildRequest({
        plantingDateRequestSpecies: names.map((name, index) => buildRequestedSpecies(`${index + 1}`, name, 10)),
      }),
    ];

    renderWithProviders(<PlantingDateRequestsTabContent />);

    // Three names fit below 768px, leaving one behind.
    expect(
      await screen.findByText(
        String(strings.formatString(strings.X_AND_N_MORE, 'Acacia koa, Dodonaea viscosa, Metrosideros polymorpha', '1'))
      )
    ).toBeInTheDocument();
  });

  it('sets the status beside the heading, before the Withdraw', async () => {
    searchResults = [buildRequest({ status: 'Partial' })];

    renderWithProviders(<PlantingDateRequestsTabContent />);

    const status = await screen.findByText(strings.PARTIALLY_FULFILLED);
    const site = screen.getByText('Abrewatia Hills');
    const withdraw = screen.getByRole('button', { name: strings.WITHDRAW });

    // The badge nests a span inside a span, so compare containment rather than the direct parent.
    expect(site.parentElement?.contains(status)).toBe(true);
    expect(domOrder(status)).toBeGreaterThan(domOrder(site));
    expect(domOrder(status)).toBeLessThan(domOrder(withdraw));
  });

  it('stacks the heading and widens the Withdraw on a phone', async () => {
    device = 'mobile';
    searchResults = [buildRequest({ status: 'Partial' })];

    renderWithProviders(<PlantingDateRequestsTabContent />);

    const status = await screen.findByText(strings.PARTIALLY_FULFILLED);
    const season = screen.getByRole('link', { name: 'Winter' });
    const site = screen.getByText('Abrewatia Hills');

    // The status gets its own line between the season and the site, rather than trailing the site.
    expect(site.parentElement?.contains(status)).toBe(false);
    expect(domOrder(status)).toBeGreaterThan(domOrder(season));
    expect(domOrder(status)).toBeLessThan(domOrder(site));

    expect(screen.getByRole('button', { name: strings.WITHDRAW }).style.width).toBe('100%');
    expect(getComputedStyle(screen.getByText(strings.REQUESTED_PLANTS).parentElement as HTMLElement).textAlign).toBe(
      'left'
    );
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
      expect(screen.queryByText(strings.VIEW_SPECIES_QUANTITIES)).not.toBeInTheDocument();

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
        `${String(strings.formatString(strings.X_LEFT, '1,900'))}${strings.PARTIALLY_FULFILLED}`,
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

    it('counts a species that is still outstanding even when another was overwithdrawn', async () => {
      searchResults = [
        buildRequest({
          status: 'Partial',
          plantingDateRequestSpecies: [
            buildRequestedSpecies('7', 'Acacia koa', 100),
            buildRequestedSpecies('8', 'Metrosideros polymorpha', 100),
          ],
          withdrawals: [buildWithdrawal('7', 150)],
        }),
      ];

      const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

      const dialog = await openQuantities(user);
      const total = within(dialog).getByText(strings.TOTAL).parentElement as HTMLElement;

      expect(within(total).getByText(strings.formatString(strings.X_LEFT, '100') as string)).toBeInTheDocument();
    });

    it('closes on Escape, leaving focus back on the link that opened it', async () => {
      const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

      const viewQuantities = await screen.findByRole('button', { name: strings.VIEW_QUANTITIES });
      const dialog = await openQuantities(user);

      // Focus has to actually be inside the dialog, or the assertion below proves nothing.
      within(dialog).getByRole('button', { name: strings.WITHDRAW }).focus();
      expect(viewQuantities).not.toHaveFocus();

      await user.keyboard('{Escape}');

      await waitFor(() => expect(screen.queryByText(strings.VIEW_SPECIES_QUANTITIES)).not.toBeInTheDocument());
      expect(viewQuantities).toHaveFocus();
    });

    it('lays every row out in one grid, so a column is as wide as the whole table needs', async () => {
      const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

      const dialog = await openQuantities(user);
      const headings = within(dialog).getByText(strings.SPECIES).parentElement as HTMLElement;
      const species = speciesRow(dialog, 'Acacia koa');
      const total = within(dialog).getByText(strings.TOTAL).parentElement as HTMLElement;

      [headings, species, total].forEach((row) => {
        expect(getComputedStyle(row).display).toBe('contents');
        expect(row.parentElement).toBe(headings.parentElement);
      });
      const grid = headings.parentElement as HTMLElement;
      expect(getComputedStyle(grid).display).toBe('grid');

      expect(getComputedStyle(grid).columnGap).toBe('normal');
    });

    it('keeps the stats in the right-hand block, after the status and Withdraw', async () => {
      renderWithProviders(<PlantingDateRequestsTabContent />);

      const stats = await screen.findByText(strings.REQUESTED_PLANTS);
      const withdraw = screen.getByRole('button', { name: strings.WITHDRAW });

      expect(domOrder(stats)).toBeGreaterThan(domOrder(withdraw));
    });

    it('offers a withdrawal for a request that is still open', async () => {
      const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

      const dialog = await openQuantities(user);

      expect(within(dialog).getByRole('button', { name: strings.WITHDRAW })).toBeInTheDocument();
    });

    it('leaves nothing outstanding on a fulfilled request, but still offers a withdrawal', async () => {
      searchResults = [
        buildPartiallyWithdrawnRequest({
          status: 'Fulfilled',
          withdrawals: [buildWithdrawal('7', 1200), buildWithdrawal('8', 2500), buildWithdrawal('9', 800)],
        }),
      ];

      const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

      const dialog = await openQuantities(user);
      const total = within(dialog).getByText(strings.TOTAL).parentElement as HTMLElement;

      expect(within(dialog).queryByText(/left/)).not.toBeInTheDocument();
      expect(within(total).getByText(strings.FULFILLED)).toBeInTheDocument();
      expect(within(dialog).getByRole('button', { name: strings.WITHDRAW })).toBeInTheDocument();
      expect(within(dialog).getByRole('button', { name: strings.CLOSE })).toBeInTheDocument();
    });
  });

  describe('requested species drawer on tablet', () => {
    beforeEach(() => {
      device = 'tablet';
      searchResults = [buildPartiallyWithdrawnRequest()];
    });

    const openDrawer = async (user: UserEvent): Promise<HTMLElement> => {
      await user.click(await screen.findByRole('button', { name: strings.VIEW_QUANTITIES }));
      return (await screen.findByText(strings.VIEW_SPECIES_QUANTITIES)).closest('.MuiDrawer-paper') as HTMLElement;
    };

    it('puts the stats under the species list, leaving the status and Withdraw above them', async () => {
      renderWithProviders(<PlantingDateRequestsTabContent />);

      const viewQuantities = await screen.findByRole('button', { name: strings.VIEW_QUANTITIES });
      const stats = screen.getByText(strings.REQUESTED_PLANTS);
      const withdraw = screen.getByRole('button', { name: strings.WITHDRAW });

      // The stats moved out of the block the status and Withdraw sit in, into the one holding the
      // species list, so they now follow the link and precede the Withdraw instead of trailing it.
      expect(domOrder(stats)).toBeGreaterThan(domOrder(viewQuantities));
      expect(domOrder(stats)).toBeLessThan(domOrder(withdraw));
    });

    it('opens as a drawer keeping the dialog table, and says which request it is for', async () => {
      const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

      const drawer = await openDrawer(user);

      expect(
        within(drawer).getByText(
          `${String(strings.formatString(strings.X_SPECIES, '3'))} · Jun 8, 2026 · Winter · Abrewatia Hills`
        )
      ).toBeInTheDocument();
      expect(columnsOf(speciesRow(drawer, 'Metrosideros polymorpha'))).toEqual([
        'Metrosideros polymorpha',
        '2,500',
        '600',
        strings.PARTIALLY_FULFILLED,
      ]);
    });

    it('drops the remaining count, which would crowd the narrower status column', async () => {
      const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

      const drawer = await openDrawer(user);
      const total = within(drawer).getByText(strings.TOTAL).parentElement as HTMLElement;

      expect(within(total).queryByText(/left/)).not.toBeInTheDocument();
      expect(within(total).getByText('4,500')).toBeInTheDocument();
      expect(within(total).getByText('1,400')).toBeInTheDocument();
      expect(within(total).getByText(strings.PARTIALLY_FULFILLED)).toBeInTheDocument();
    });

    it('closes or withdraws from the foot of the drawer', async () => {
      const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

      const drawer = await openDrawer(user);

      expect(within(drawer).getByRole('button', { name: strings.WITHDRAW })).toBeInTheDocument();

      // The header's X carries the same accessible name, so reach the footer button by its label.
      await user.click(within(drawer).getByText(strings.CLOSE));

      await waitFor(() => expect(screen.queryByText(strings.VIEW_SPECIES_QUANTITIES)).not.toBeInTheDocument());
    });
  });

  describe('requested species bottom sheet on mobile', () => {
    beforeEach(() => {
      device = 'mobile';
      searchResults = [buildPartiallyWithdrawnRequest()];
    });

    const openSheet = async (user: UserEvent): Promise<HTMLElement> => {
      await user.click(await screen.findByRole('button', { name: strings.VIEW_QUANTITIES }));
      return (await screen.findByText(strings.VIEW_SPECIES_QUANTITIES)).closest('.MuiDrawer-paper') as HTMLElement;
    };

    /** The sheet's two-line entry for a species: the name's row and the quantities beneath it. */
    const speciesEntry = (sheet: HTMLElement, scientificName: string): HTMLElement =>
      within(sheet).getByText(scientificName).parentElement?.parentElement as HTMLElement;

    it('opens as a sheet, headed by the same subtitle as the dialog', async () => {
      const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

      const sheet = await openSheet(user);

      expect(
        within(sheet).getByText(
          `${String(strings.formatString(strings.X_SPECIES, '3'))} · Jun 8, 2026 · Winter · Abrewatia Hills`
        )
      ).toBeInTheDocument();
    });

    it('gives each species two lines, with the dialog pills and the count still owed', async () => {
      const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

      const sheet = await openSheet(user);

      expect(within(speciesEntry(sheet, 'Acacia koa')).getByText(strings.NEW)).toBeInTheDocument();
      expect(within(speciesEntry(sheet, 'Zanthoxylum dipetalum')).getByText(strings.FULFILLED)).toBeInTheDocument();

      const partial = speciesEntry(sheet, 'Metrosideros polymorpha');
      expect(within(partial).getByText(strings.PARTIALLY_FULFILLED)).toBeInTheDocument();
      expect(within(partial).getByText('2,500').parentElement?.textContent).toBe(
        String(strings.formatString(strings.REQUESTED_X, '2,500'))
      );
      expect(within(partial).getByText('600').parentElement?.textContent).toBe(
        String(strings.formatString(strings.WITHDRAWN_X, '600'))
      );
      expect(within(partial).getByText(String(strings.formatString(strings.X_LEFT, '1,900')))).toBeInTheDocument();
    });

    it('totals the request along the foot of the sheet, with the count still owed', async () => {
      const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

      const sheet = await openSheet(user);
      const footer = within(sheet).getByRole('button', { name: strings.WITHDRAW }).parentElement as HTMLElement;

      expect(footer.textContent).toBe(
        [
          String(strings.formatString(strings.X_REQUESTED, '4,500')),
          String(strings.formatString(strings.X_WITHDRAWN, '1,400')),
          String(strings.formatString(strings.X_LEFT, '3,100')),
        ].join(' · ') + strings.WITHDRAW
      );
    });

    it('still offers a withdrawal from the sheet for a fulfilled request', async () => {
      searchResults = [
        buildPartiallyWithdrawnRequest({
          status: 'Fulfilled',
          withdrawals: [buildWithdrawal('7', 1200), buildWithdrawal('8', 2500), buildWithdrawal('9', 800)],
        }),
      ];

      const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

      const sheet = await openSheet(user);

      expect(within(sheet).getByRole('button', { name: strings.WITHDRAW })).toBeInTheDocument();
      expect(within(sheet).getAllByText(strings.FULFILLED)).toHaveLength(3);
      expect(within(sheet).queryByText(/left/)).not.toBeInTheDocument();
    });
  });
});
