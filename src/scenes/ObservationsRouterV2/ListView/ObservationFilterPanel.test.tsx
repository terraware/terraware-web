import React from 'react';

import { rs } from '@rstest/core';
import { screen } from '@testing-library/react';

import { ALL_PLANTING_SITES } from 'src/hooks/useStickyPlantingSiteId';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import ObservationFilterPanel from 'src/scenes/ObservationsRouterV2/ListView/ObservationFilterPanel';
import ObservationFiltersProvider, { type ViewMode } from 'src/scenes/ObservationsRouterV2/ObservationFiltersProvider';
import strings from 'src/strings';
import { buildUser, mockGet, renderWithProviders, selectDropdownOption } from 'src/test-utils';

const { trackEvent } = rs.hoisted(() => ({ trackEvent: rs.fn() }));
rs.mock('src/hooks/useTrackEvent', () => ({ useTrackEvent: () => trackEvent }));

const renderPanel = (viewMode: ViewMode = 'split') => {
  mockGet('/api/v1/users/me/preferences', {
    preferences: { baselineSurveyObservations: true, scheduledBiomassMonitoringObservations: true },
  });
  mockGet('/api/v1/users/me', { user: buildUser() });
  mockGet('/api/v1/tracking/observations/results', { observations: [] });

  return renderWithProviders(
    <ObservationFiltersProvider>
      <ObservationFilterPanel plantingSiteId={ALL_PLANTING_SITES} />
    </ObservationFiltersProvider>,
    { currentUser: { userPreferences: { observationsViewMode: viewMode } } }
  );
};

const chooseMonitoringType = async (user: ReturnType<typeof renderPanel>['user'], option: string) => {
  await screen.findByText(strings.MONITORING_TYPE);
  await selectDropdownOption(user, 'observation-type-filter', option);
};

const filterEvents = () =>
  trackEvent.mock.calls
    .filter(([name]) => name === MIXPANEL_EVENTS.OBSERVATIONS_FILTER_APPLIED)
    .map(([, properties]) => properties);

beforeEach(() => {
  sessionStorage.clear();
  trackEvent.mockClear();
});

describe('ObservationFilterPanel analytics', () => {
  it.each([
    [strings.PLANT_MONITORING, 'Plant Monitoring'],
    [strings.BIOMASS_MONITORING, 'Biomass Monitoring'],
    [strings.BASELINE_SURVEY, 'Baseline Survey'],
  ])('reports %s as the monitoring type the user filtered by', async (option, value) => {
    const { user } = renderPanel();

    await chooseMonitoringType(user, option);

    expect(filterEvents()).toEqual([{ filter: 'monitoring_type', value, view: 'split' }]);
  });

  it('reports going back to every monitoring type', async () => {
    const { user } = renderPanel();

    await chooseMonitoringType(user, strings.BIOMASS_MONITORING);
    await chooseMonitoringType(user, strings.ALL_MONITORING_TYPES);

    expect(filterEvents()).toEqual([
      { filter: 'monitoring_type', value: 'Biomass Monitoring', view: 'split' },
      { filter: 'monitoring_type', value: 'All', view: 'split' },
    ]);
  });

  it.each(['map', 'list'] as const)('reports the %s view the filter was applied from', async (viewMode) => {
    const { user } = renderPanel(viewMode);

    await chooseMonitoringType(user, strings.PLANT_MONITORING);

    expect(filterEvents()).toEqual([{ filter: 'monitoring_type', value: 'Plant Monitoring', view: viewMode }]);
  });
});
