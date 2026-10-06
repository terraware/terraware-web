import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import PlantingDateRequestsTabContent from 'src/scenes/NurseryRouter/PlantingDateRequestsTabContent';
import strings from 'src/strings';
import { mockGet, renderWithProviders, selectDropdownOption, server } from 'src/test-utils';

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

/** Request bodies sent to the search endpoint, newest last. */
let searchRequests: Record<string, any>[];

/** Results the search endpoint returns for the `plantingDateRequests` prefix. */
let searchResults: Record<string, unknown>[];

const statusesOf = (body: Record<string, any>): string[] =>
  body.search.children.find((child: { field: string }) => child.field === 'status(raw)').values;

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

  it('tells the user which empty list they are looking at', async () => {
    searchResults = [];

    const { user } = renderWithProviders(<PlantingDateRequestsTabContent />);

    expect(await screen.findByText(strings.NO_PENDING_REQUESTS)).toBeInTheDocument();

    await selectDropdownOption(user, 'filter-status', strings.FULFILLED);

    expect(await screen.findByText(strings.NO_REQUESTS_FOR_SELECTED_FILTERS)).toBeInTheDocument();
  });
});
