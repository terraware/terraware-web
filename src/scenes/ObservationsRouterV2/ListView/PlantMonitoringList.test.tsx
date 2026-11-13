import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';

import { ALL_PLANTING_SITES } from 'src/hooks/useStickyPlantingSiteId';
import { ObservationResultsPayload } from 'src/queries/generated/observations';
import strings from 'src/strings';
import {
  buildPlantingSite,
  buildUser,
  captureRequests,
  mockGet,
  renderWithProviders,
  selectDropdownOption,
} from 'src/test-utils';

import ObservationFiltersProvider, { ObservationTypeFilter } from '../ObservationFiltersProvider';
import ObservationFilterPanel from './ObservationFilterPanel';
import PlantMonitoringList from './PlantMonitoringList';
import ObservationListView from './index';

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
const BASELINE_OBSERVATION = buildObservationResults({
  observationId: 3,
  startDate: '2026-04-01',
  type: 'Baseline Survey',
});
const BASELINE_ROW = /April 2026/;

/**
 * Renders the list with scheduled observations of each type.
 * The returned requests are the ones that carry the feature flag, so a test can tell "the flag said
 * no" apart from "the flag hasn't arrived yet".
 */
const renderList = (
  scheduledBiomassMonitoringObservations: boolean,
  observationType?: ObservationTypeFilter,
  {
    baselineSurveyObservations = false,
    showFilterPanel = false,
    observations = [PLANT_OBSERVATION, BIOMASS_OBSERVATION, BASELINE_OBSERVATION],
  } = {}
) => {
  if (observationType !== undefined) {
    sessionStorage.setItem(OBSERVATION_TYPE_SESSION_KEY, observationType);
  }

  const preferenceRequests = captureRequests('get', PREFERENCES_URL, {
    preferences: { scheduledBiomassMonitoringObservations, baselineSurveyObservations },
  });
  mockGet('/api/v1/users/me', { user: buildUser() });
  mockGet('/api/v1/users/me/savedTableViews', { views: [] });
  mockGet('/api/v1/tracking/sites', { sites: [buildPlantingSite()] });
  mockGet('/api/v1/tracking/observations/results', { observations });
  // Reached by the row action menu's export options.
  mockGet('/api/v1/species', { species: [] });

  const { user } = renderWithProviders(
    <ObservationFiltersProvider>
      {showFilterPanel && <ObservationFilterPanel plantingSiteId={ALL_PLANTING_SITES} />}
      <PlantMonitoringList plantingSiteId={ALL_PLANTING_SITES} />
    </ObservationFiltersProvider>
  );

  return { preferenceRequests, user };
};

describe('PlantMonitoringList', () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ])('only offers scheduling with eligible sites (biomass=%s, eligible=%s)', async (enabled, eligible) => {
    const sites = [
      buildPlantingSite({ id: 1, name: 'No strata', strata: [] }),
      buildPlantingSite({ id: 2, name: 'Another site without strata', strata: [] }),
      ...(eligible ? [buildPlantingSite({ id: 3 })] : []),
    ];
    const preferences = {
      scheduledBiomassMonitoringObservations: enabled,
      observationsViewMode: 'list',
      'observations-list': { plantingSiteId: ALL_PLANTING_SITES },
    };
    mockGet(PREFERENCES_URL, { preferences });
    mockGet('/api/v1/users/me', { user: buildUser() });
    mockGet('/api/v1/users/me/savedTableViews', { views: [] });
    mockGet('/api/v1/tracking/sites', { sites });
    mockGet('/api/v1/tracking/sites/reportedPlants', {
      sites: sites.map((site) => ({ id: site.id, strata: [{ substrata: [{ totalPlants: 10 }] }] })),
    });
    mockGet('/api/v1/tracking/observations', { observations: [] });
    mockGet('/api/v1/tracking/observations/results', { observations: [PLANT_OBSERVATION] });
    mockGet('/api/v1/species', { species: [] });
    renderWithProviders(<ObservationListView />, {
      route: '/observations',
      currentUser: { userPreferences: preferences },
    });

    expect(await screen.findByRole('row', { name: PLANT_ROW })).toBeVisible();
    if (eligible) {
      expect(await screen.findByRole('button', { name: strings.SCHEDULE_OBSERVATION })).toBeVisible();
    } else {
      expect(screen.queryByRole('button', { name: strings.SCHEDULE_OBSERVATION })).not.toBeInTheDocument();
    }
  });

  it('names the monitoring type of each observation when biomass scheduling is enabled', async () => {
    renderList(true);

    expect(await screen.findByRole('columnheader', { name: new RegExp(strings.MONITORING_TYPE) })).toBeVisible();

    const plantRow = await screen.findByRole('row', { name: PLANT_ROW });
    expect(within(plantRow).getByText(strings.PLANT_MONITORING)).toBeVisible();

    const biomassRow = screen.getByRole('row', { name: BIOMASS_ROW });
    expect(within(biomassRow).getByText(strings.BIOMASS_MONITORING)).toBeVisible();
    const baselineRow = screen.getByRole('row', { name: BASELINE_ROW });
    expect(within(baselineRow).getByText(strings.BASELINE_SURVEY)).toBeVisible();
    expect(within(baselineRow).queryByText(strings.PLANT_MONITORING)).not.toBeInTheDocument();
  });

  it('leaves out biomass observations and the monitoring type when biomass scheduling is disabled', async () => {
    const { preferenceRequests } = renderList(false);

    await waitFor(() => expect(preferenceRequests).toHaveLength(1));
    expect(await screen.findByRole('row', { name: PLANT_ROW })).toBeVisible();

    expect(screen.queryByRole('row', { name: BIOMASS_ROW })).not.toBeInTheDocument();
    expect(screen.queryByRole('row', { name: BASELINE_ROW })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: new RegExp(strings.MONITORING_TYPE) })).not.toBeInTheDocument();
  });

  it('shows only biomass observations when the monitoring type filter is set to biomass', async () => {
    renderList(true, 'Biomass Measurements');

    expect(await screen.findByRole('row', { name: BIOMASS_ROW })).toBeVisible();
    expect(screen.queryByRole('row', { name: PLANT_ROW })).not.toBeInTheDocument();
    expect(screen.queryByRole('row', { name: BASELINE_ROW })).not.toBeInTheDocument();
  });

  it('shows only plant monitoring observations when the monitoring type filter is set to monitoring', async () => {
    renderList(true, 'Monitoring');

    // The monitoring type column only appears once the flag has arrived, so waiting for it keeps
    // the missing biomass row from being explained by the flag rather than by the filter.
    expect(await screen.findByRole('columnheader', { name: new RegExp(strings.MONITORING_TYPE) })).toBeVisible();

    expect(await screen.findByRole('row', { name: PLANT_ROW })).toBeVisible();
    expect(screen.queryByRole('row', { name: BIOMASS_ROW })).not.toBeInTheDocument();
    expect(screen.queryByRole('row', { name: BASELINE_ROW })).not.toBeInTheDocument();
  });

  it('restores a saved baseline filter and shows only Baseline Surveys', async () => {
    renderList(true, 'Baseline Survey', { baselineSurveyObservations: true });

    expect(await screen.findByRole('row', { name: BASELINE_ROW })).toBeVisible();
    await waitFor(() => expect(screen.queryByRole('row', { name: PLANT_ROW })).not.toBeInTheDocument());
    expect(screen.queryByRole('row', { name: BIOMASS_ROW })).not.toBeInTheDocument();
  });

  it('does not apply a saved baseline filter when the baseline flag is off', async () => {
    renderList(true, 'Baseline Survey');

    expect(await screen.findByRole('row', { name: PLANT_ROW })).toBeVisible();
    expect(screen.getByRole('row', { name: BIOMASS_ROW })).toBeVisible();
    expect(screen.getByRole('row', { name: BASELINE_ROW })).toBeVisible();
  });

  it('filters Baseline Surveys from the monitoring type dropdown and can clear the filter', async () => {
    const { user } = renderList(true, undefined, { baselineSurveyObservations: true, showFilterPanel: true });
    expect(await screen.findByRole('row', { name: BASELINE_ROW })).toBeVisible();
    await selectDropdownOption(user, 'observation-type-filter', strings.BASELINE_SURVEY);

    expect(screen.getByRole('row', { name: BASELINE_ROW })).toBeVisible();
    expect(screen.queryByRole('row', { name: PLANT_ROW })).not.toBeInTheDocument();
    expect(screen.queryByRole('row', { name: BIOMASS_ROW })).not.toBeInTheDocument();

    await selectDropdownOption(user, 'observation-type-filter', strings.PLANT_MONITORING);
    expect(screen.getByRole('row', { name: PLANT_ROW })).toBeVisible();
    expect(screen.queryByRole('row', { name: BASELINE_ROW })).not.toBeInTheDocument();

    await selectDropdownOption(user, 'observation-type-filter', strings.ALL_MONITORING_TYPES);
    expect(screen.getByRole('row', { name: BASELINE_ROW })).toBeVisible();
    expect(screen.getByRole('row', { name: BIOMASS_ROW })).toBeVisible();
  });

  it('does not offer a Baseline Survey filter when its flag is off', async () => {
    const { user } = renderList(true, undefined, { showFilterPanel: true });
    expect(await screen.findByRole('row', { name: BASELINE_ROW })).toBeVisible();
    const input = screen.getByPlaceholderText(strings.ALL_MONITORING_TYPES);
    await user.click(input);
    const options = await screen.findByRole('list');
    expect(within(options).getByText(strings.PLANT_MONITORING)).toBeVisible();
    expect(within(options).queryByText(strings.BASELINE_SURVEY)).not.toBeInTheDocument();
  });

  it.each([
    { observations: [PLANT_OBSERVATION], message: () => strings.NO_OBSERVATIONS_MATCH_FILTERS },
    { observations: [], message: () => strings.NO_ASSIGNED_PLOT_OBSERVATIONS_RECORDED },
  ])(
    'shows the appropriate empty message for a baseline filter ($observations.length observations)',
    async ({ observations, message }) => {
      renderList(true, 'Baseline Survey', { baselineSurveyObservations: true, observations });
      expect(await screen.findByText(message())).toBeVisible();
      expect(screen.queryByRole('row', { name: PLANT_ROW })).not.toBeInTheDocument();
    }
  );
});
