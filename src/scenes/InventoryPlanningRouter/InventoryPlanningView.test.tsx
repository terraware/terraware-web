import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import { PlantingSeasonPayload } from 'src/queries/generated/plantingSeasons';
import { InventoryPlanningSeasonSearch } from 'src/queries/search/inventoryPlanning';
import InventoryPlanningView from 'src/scenes/InventoryPlanningRouter/InventoryPlanningView';
import strings from 'src/strings';
import { mockError, mockGet, mockPost, renderWithProviders, selectDropdownOption, server } from 'src/test-utils';

const KOA_ID = 1;
const OHIA_ID = 2;
const NORTH_SITE_ID = 1;
const SOUTH_SITE_ID = 2;
const SPRING_ID = 10;
const AUTUMN_ID = 20;

const KOA = 'Acacia koa';
const OHIA = 'Metrosideros polymorpha';
const NORTH_SITE = 'North Field';
const SOUTH_SITE = 'South Field';
const SPRING = 'Spring 2026';
const AUTUMN = 'Autumn 2026';
const WINTER = 'Winter 2025';
const FALLOW = 'Fallow 2026';

/** Matches a save for any planting season, so a save against the wrong one is caught rather than unhandled. */
const ALLOCATED_SPECIES_ROUTE = '/api/v1/planting-seasons/:plantingSeasonId/allocated-species';

const KOA_AVAILABLE = 1000;
const KOA_TARGET = 1200;
const KOA_ALLOCATED = 300;

const buildPlantingSeason = (overrides: Partial<PlantingSeasonPayload> = {}): PlantingSeasonPayload => ({
  endDate: '2026-05-31',
  id: SPRING_ID,
  name: SPRING,
  plantingSiteId: NORTH_SITE_ID,
  speciesTargets: [{ quantity: KOA_TARGET, speciesId: KOA_ID, substratumId: 1 }],
  startDate: '2026-03-01',
  status: 'Active',
  ...overrides,
});

const springSearchResult = (): InventoryPlanningSeasonSearch => ({
  allocatedSpecies: [{ species_id: `${KOA_ID}`, 'quantity(raw)': `${KOA_ALLOCATED}` }],
  endDate: '2026-05-31',
  id: `${SPRING_ID}`,
  name: SPRING,
  plantingSite_id: `${NORTH_SITE_ID}`,
  plantingSite_name: NORTH_SITE,
  speciesTargets: [
    {
      'quantity(raw)': `${KOA_TARGET}`,
      species_commonName: 'Koa',
      species_id: `${KOA_ID}`,
      species_scientificName: KOA,
    },
  ],
  startDate: '2026-03-01',
  status: 'Active',
});

const autumnSearchResult = (): InventoryPlanningSeasonSearch => ({
  endDate: '2026-11-30',
  id: `${AUTUMN_ID}`,
  name: AUTUMN,
  plantingSite_id: `${SOUTH_SITE_ID}`,
  plantingSite_name: SOUTH_SITE,
  speciesTargets: [{ 'quantity(raw)': '500', species_id: `${OHIA_ID}`, species_scientificName: OHIA }],
  startDate: '2026-09-01',
  status: 'Active',
});

/** What the planting season search answers with, before the request's own filters are applied. */
let seasonSearchResults: InventoryPlanningSeasonSearch[];

type SearchFilter = { field: string; values: string[] };

/** Applies the filters the view asked for, so a missing filter shows up as a row that should not be there. */
const applySearchFilters = (
  results: InventoryPlanningSeasonSearch[],
  filters: SearchFilter[]
): InventoryPlanningSeasonSearch[] => {
  const valueOf = (field: string) => filters.find((filter) => filter.field === field)?.values?.[0];

  const plantingSiteId = valueOf('plantingSite_id');
  const plantingSeasonId = valueOf('id');
  const speciesId = valueOf('speciesTargets.species_id');

  return results
    .filter((season) => plantingSiteId === undefined || season.plantingSite_id === plantingSiteId)
    .filter((season) => plantingSeasonId === undefined || season.id === plantingSeasonId)
    .filter(
      (season) =>
        speciesId === undefined || (season.speciesTargets ?? []).some((target) => target.species_id === speciesId)
    );
};

/**
 * Accepts allocation saves and reflects them in what the search answers with next, the way the
 * server would, so a test can tell "the save was sent" apart from "the save came back".
 */
const acceptAllocationSaves = (): Request[] => {
  const requests: Request[] = [];

  server.use(
    http.put(ALLOCATED_SPECIES_ROUTE, async ({ params, request }) => {
      requests.push(request.clone());
      const { quantity, speciesId } = (await request.json()) as { quantity: number; speciesId: number };

      seasonSearchResults = seasonSearchResults.map((season) =>
        season.id === String(params.plantingSeasonId)
          ? {
              ...season,
              allocatedSpecies: [
                ...(season.allocatedSpecies ?? []).filter((entry) => entry.species_id !== `${speciesId}`),
                { species_id: `${speciesId}`, 'quantity(raw)': `${quantity}` },
              ],
            }
          : season
      );

      return HttpResponse.json({ status: 'ok' });
    })
  );

  return requests;
};

/**
 * The detail row for a planting season. Its edit control is an icon-only button with no accessible
 * name, so it cannot be queried directly; scoping to the row is the next best thing. Giving that
 * button a label would let callers use `getByRole('button', { name: ... })` instead.
 */
const seasonRow = (plantingSeasonName: string): HTMLElement => {
  const row = screen.getByText(plantingSeasonName).closest('div')?.parentElement;
  if (!row) {
    throw new Error(`No planting season row for "${plantingSeasonName}"`);
  }
  return row;
};

const editAllocation = (plantingSeasonName: string): HTMLElement =>
  within(seasonRow(plantingSeasonName)).getByRole('button');

const allocationField = (): HTMLElement => screen.getByRole('spinbutton');

const openDropdown = async (user: ReturnType<typeof renderWithProviders>['user'], dropdownId: string) => {
  const input = document.querySelector(`#${dropdownId} input`);
  if (!input) {
    throw new Error(`No dropdown with id "${dropdownId}"`);
  }
  await user.click(input);
  return await screen.findByRole('list');
};

beforeEach(() => {
  seasonSearchResults = [springSearchResult(), autumnSearchResult()];

  mockGet('/api/v1/species', {
    species: [
      { id: KOA_ID, scientificName: KOA, commonName: 'Koa' },
      { id: OHIA_ID, scientificName: OHIA },
    ],
  });
  mockGet('/api/v1/tracking/sites', {
    sites: [
      { id: NORTH_SITE_ID, name: NORTH_SITE, organizationId: 1 },
      { id: SOUTH_SITE_ID, name: SOUTH_SITE, organizationId: 1 },
    ],
  });
  mockGet('/api/v1/planting-seasons', {
    seasons: [
      buildPlantingSeason(),
      buildPlantingSeason({
        endDate: '2026-11-30',
        id: AUTUMN_ID,
        name: AUTUMN,
        plantingSiteId: SOUTH_SITE_ID,
        speciesTargets: [{ quantity: 500, speciesId: OHIA_ID, substratumId: 2 }],
        startDate: '2026-09-01',
      }),
      buildPlantingSeason({ id: 30, name: WINTER, status: 'Closed' }),
      buildPlantingSeason({ id: 40, name: FALLOW, speciesTargets: [], status: 'Upcoming' }),
    ],
  });
  mockGet('/api/v1/planting-seasons/notifications', { notifications: [] });
  mockPost('/api/v1/events/list', { events: [] });

  server.use(
    http.post('/api/v1/search', async ({ request }) => {
      const body = (await request.json()) as { prefix: string; search: { children: SearchFilter[] } };

      if (body.prefix === 'species') {
        return HttpResponse.json({
          status: 'ok',
          results: [
            {
              id: `${KOA_ID}`,
              scientificName: KOA,
              inventory: { 'hardeningOffQuantity(raw)': '400', 'readyQuantity(raw)': '600' },
            },
            { id: `${OHIA_ID}`, scientificName: OHIA, inventory: { 'readyQuantity(raw)': '600' } },
          ],
        });
      }

      return HttpResponse.json({
        status: 'ok',
        results: applySearchFilters(seasonSearchResults, body.search.children),
      });
    })
  );
});

describe('InventoryPlanningView rows and filters', () => {
  it('shows what is available, targeted and allocated for each species', async () => {
    renderWithProviders(<InventoryPlanningView />);

    expect(await screen.findByText(KOA)).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
  });

  it('says there is nothing to plan when no planting season matches', async () => {
    seasonSearchResults = [];

    renderWithProviders(<InventoryPlanningView />);

    expect(await screen.findByText(strings.NO_ACTIVE_PLANTING_SEASONS_FOR_FILTERS)).toBeInTheDocument();
    expect(screen.queryByText(KOA)).not.toBeInTheDocument();
  });

  it('limits the rows to the selected planting site', async () => {
    const { user } = renderWithProviders(<InventoryPlanningView />);

    expect(await screen.findByText(KOA)).toBeInTheDocument();

    await selectDropdownOption(user, 'filter-planting-site', SOUTH_SITE);

    expect(await screen.findByText(OHIA)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(KOA)).not.toBeInTheDocument());
  });

  it('limits the rows to the selected species', async () => {
    const { user } = renderWithProviders(<InventoryPlanningView />);

    expect(await screen.findByText(OHIA)).toBeInTheDocument();

    await selectDropdownOption(user, 'filter-species', KOA);

    await waitFor(() => expect(screen.queryByText(OHIA)).not.toBeInTheDocument());
    expect(screen.getByText(KOA)).toBeInTheDocument();
  });

  it('offers only planting seasons that are open and have species targets', async () => {
    const { user } = renderWithProviders(<InventoryPlanningView />);

    expect(await screen.findByText(KOA)).toBeInTheDocument();
    const options = await openDropdown(user, 'filter-planting-season');

    expect(within(options).getByText(SPRING)).toBeInTheDocument();
    expect(within(options).getByText(AUTUMN)).toBeInTheDocument();
    expect(within(options).queryByText(WINTER)).not.toBeInTheDocument();
    expect(within(options).queryByText(FALLOW)).not.toBeInTheDocument();
  });

  it('offers only the planting seasons of the selected planting site', async () => {
    const { user } = renderWithProviders(<InventoryPlanningView />);

    expect(await screen.findByText(KOA)).toBeInTheDocument();
    await selectDropdownOption(user, 'filter-planting-site', NORTH_SITE);
    const options = await openDropdown(user, 'filter-planting-season');

    expect(within(options).getByText(SPRING)).toBeInTheDocument();
    expect(within(options).queryByText(AUTUMN)).not.toBeInTheDocument();
  });

  it('offers only the species targeted by the selected planting season', async () => {
    const { user } = renderWithProviders(<InventoryPlanningView />);

    expect(await screen.findByText(KOA)).toBeInTheDocument();
    await selectDropdownOption(user, 'filter-planting-season', AUTUMN);
    const options = await openDropdown(user, 'filter-species');

    expect(within(options).getByText(OHIA)).toBeInTheDocument();
    expect(within(options).queryByText(KOA)).not.toBeInTheDocument();
  });

  it('drops a species filter the newly selected planting season does not target', async () => {
    const { user } = renderWithProviders(<InventoryPlanningView />);

    expect(await screen.findByText(KOA)).toBeInTheDocument();
    await selectDropdownOption(user, 'filter-species', KOA);
    await selectDropdownOption(user, 'filter-planting-season', AUTUMN);

    // Keeping the Koa filter would leave the table empty while still naming the selected season.
    expect(await screen.findByText(OHIA)).toBeInTheDocument();
    expect(document.querySelector('#filter-species input')).toHaveValue(strings.ALL_SPECIES);
  });
});

describe('InventoryPlanningView editing an allocation', () => {
  const expandKoa = async (user: ReturnType<typeof renderWithProviders>['user']) => {
    await user.click(await screen.findByText(KOA));
    expect(await screen.findByText(SPRING)).toBeInTheDocument();
  };

  it('saves the new quantity against the species and planting season being edited', async () => {
    const saves = acceptAllocationSaves();

    const { user } = renderWithProviders(<InventoryPlanningView />);
    await expandKoa(user);

    await user.click(editAllocation(SPRING));
    await user.clear(allocationField());
    await user.type(allocationField(), '500');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(saves).toHaveLength(1));
    expect(new URL(saves[0].url).pathname).toBe(`/api/v1/planting-seasons/${SPRING_ID}/allocated-species`);
    expect(await saves[0].json()).toEqual({ quantity: 500, speciesId: KOA_ID });
  });

  it('shows the saved quantity once the save comes back', async () => {
    acceptAllocationSaves();

    const { user } = renderWithProviders(<InventoryPlanningView />);
    await expandKoa(user);

    await user.click(editAllocation(SPRING));
    await user.clear(allocationField());
    await user.type(allocationField(), '500');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument());
    expect(within(seasonRow(SPRING)).getByText('500')).toBeInTheDocument();
  });

  it('reports the failure and keeps the previous quantity when the save fails', async () => {
    mockError('put', ALLOCATED_SPECIES_ROUTE);

    const { store, user } = renderWithProviders(<InventoryPlanningView />);
    await expandKoa(user);

    await user.click(editAllocation(SPRING));
    await user.clear(allocationField());
    await user.type(allocationField(), '500');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' });
    });

    // Showing 500 after a failed save would tell the user the nursery owes plants it was never asked for.
    expect(within(seasonRow(SPRING)).getByText(`${KOA_ALLOCATED}`)).toBeInTheDocument();
  });

  it('sends nothing when the quantity is left unchanged', async () => {
    const saves = acceptAllocationSaves();

    const { user } = renderWithProviders(<InventoryPlanningView />);
    await expandKoa(user);

    await user.click(editAllocation(SPRING));
    await user.tab();

    await waitFor(() => expect(within(seasonRow(SPRING)).getByText(`${KOA_ALLOCATED}`)).toBeInTheDocument());
    expect(saves).toHaveLength(0);
  });

  it('warns when the quantity is more than the inventory on hand', async () => {
    acceptAllocationSaves();

    const { user } = renderWithProviders(<InventoryPlanningView />);
    await expandKoa(user);

    await user.click(editAllocation(SPRING));
    await user.clear(allocationField());
    await user.type(allocationField(), `${KOA_AVAILABLE + 1}`);

    expect(
      screen.getByText(strings.formatString(strings.EXCEEDS_AVAILABLE_X, KOA_AVAILABLE).toString())
    ).toBeInTheDocument();
  });
});
