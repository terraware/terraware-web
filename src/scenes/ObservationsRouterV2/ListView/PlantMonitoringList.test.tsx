import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';

import { ALL_PLANTING_SITES } from 'src/hooks/useStickyPlantingSiteId';
import { ObservationResultsPayload } from 'src/queries/generated/observations';
import strings from 'src/strings';
import { buildPlantingSite, buildUser, captureRequests, mockGet, renderWithProviders } from 'src/test-utils';

import ObservationFiltersProvider, { ObservationTypeFilter } from '../ObservationFiltersProvider';
import PlantMonitoringList from './PlantMonitoringList';

const PREFERENCES_URL = '/api/v1/users/me/preferences';

// Where the filter panel persists the Monitoring Type selection, and where the provider reads it
// back on mount, so seeding it stands in for a user having picked a type.
const OBSERVATION_TYPE_SESSION_KEY = 'observation-type';

const buildObservationResults = (overrides: Partial<ObservationResultsPayload> = {}): ObservationResultsPayload => ({
  isAdHoc: false,
  observationId: 1,
  pending: false,
  plantingSiteId: 1,
  species: [],
  startDate: '2026-02-01',
  state: 'Upcoming',
  strata: [],
  type: 'Monitoring',
  ...overrides,
});

// The observation column shows the month and year an observation starts, which is how each row is
// identified here.
const PLANT_OBSERVATION = buildObservationResults({ observationId: 1, startDate: '2026-02-01' });
const PLANT_ROW = /February 2026/;

const BIOMASS_OBSERVATION = buildObservationResults({
  observationId: 2,
  startDate: '2026-03-05',
  type: 'Biomass Measurements',
});
const BIOMASS_ROW = /March 2026/;

/**
 * Renders the list with one scheduled plant monitoring observation and one scheduled biomass one.
 * The returned requests are the ones that carry the feature flag, so a test can tell "the flag said
 * no" apart from "the flag hasn't arrived yet".
 */
const renderList = (scheduledBiomassMonitoringObservations: boolean, observationType?: ObservationTypeFilter) => {
  if (observationType !== undefined) {
    sessionStorage.setItem(OBSERVATION_TYPE_SESSION_KEY, observationType);
  }

  const preferenceRequests = captureRequests('get', PREFERENCES_URL, {
    preferences: { scheduledBiomassMonitoringObservations },
  });
  mockGet('/api/v1/users/me', { user: buildUser() });
  mockGet('/api/v1/users/me/savedTableViews', { views: [] });
  mockGet('/api/v1/tracking/sites', { sites: [buildPlantingSite()] });
  mockGet('/api/v1/tracking/observations/results', { observations: [PLANT_OBSERVATION, BIOMASS_OBSERVATION] });
  // Reached by the row action menu's export options.
  mockGet('/api/v1/species', { species: [] });

  renderWithProviders(
    <ObservationFiltersProvider>
      <PlantMonitoringList plantingSiteId={ALL_PLANTING_SITES} />
    </ObservationFiltersProvider>
  );

  return { preferenceRequests };
};

describe('PlantMonitoringList', () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('names the monitoring type of each observation when biomass scheduling is enabled', async () => {
    renderList(true);

    expect(await screen.findByRole('columnheader', { name: new RegExp(strings.MONITORING_TYPE) })).toBeVisible();

    const plantRow = await screen.findByRole('row', { name: PLANT_ROW });
    expect(within(plantRow).getByText(strings.PLANT_MONITORING)).toBeVisible();

    const biomassRow = screen.getByRole('row', { name: BIOMASS_ROW });
    expect(within(biomassRow).getByText(strings.BIOMASS_MONITORING)).toBeVisible();
  });

  it('leaves out biomass observations and the monitoring type when biomass scheduling is disabled', async () => {
    const { preferenceRequests } = renderList(false);

    await waitFor(() => expect(preferenceRequests).toHaveLength(1));
    expect(await screen.findByRole('row', { name: PLANT_ROW })).toBeVisible();

    expect(screen.queryByRole('row', { name: BIOMASS_ROW })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: new RegExp(strings.MONITORING_TYPE) })).not.toBeInTheDocument();
  });

  it('shows only biomass observations when the monitoring type filter is set to biomass', async () => {
    renderList(true, 'Biomass Measurements');

    expect(await screen.findByRole('row', { name: BIOMASS_ROW })).toBeVisible();
    expect(screen.queryByRole('row', { name: PLANT_ROW })).not.toBeInTheDocument();
  });

  it('shows only plant monitoring observations when the monitoring type filter is set to monitoring', async () => {
    renderList(true, 'Monitoring');

    // The monitoring type column only appears once the flag has arrived, so waiting for it keeps
    // the missing biomass row from being explained by the flag rather than by the filter.
    expect(await screen.findByRole('columnheader', { name: new RegExp(strings.MONITORING_TYPE) })).toBeVisible();

    expect(await screen.findByRole('row', { name: PLANT_ROW })).toBeVisible();
    expect(screen.queryByRole('row', { name: BIOMASS_ROW })).not.toBeInTheDocument();
  });
});
