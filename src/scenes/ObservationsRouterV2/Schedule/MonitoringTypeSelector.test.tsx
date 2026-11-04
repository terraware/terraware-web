import React from 'react';

import { rstest } from '@rstest/core';
import { screen } from '@testing-library/react';

import MonitoringTypeSelector from 'src/scenes/ObservationsRouterV2/Schedule/MonitoringTypeSelector';
import { MonitoringType } from 'src/scenes/ObservationsRouterV2/Schedule/monitoringTypes';
import { UpcomingObservationStartDates } from 'src/scenes/ObservationsRouterV2/Schedule/useObservablePlantingSites';
import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

const renderSelector = (
  selectedMonitoringType: MonitoringType,
  upcomingObservationStartDates: UpcomingObservationStartDates = {}
) => {
  const onChange = rstest.fn();

  const { user } = renderWithProviders(
    <MonitoringTypeSelector
      onChange={onChange}
      selectedMonitoringType={selectedMonitoringType}
      upcomingObservationStartDates={upcomingObservationStartDates}
    />
  );

  return { onChange, user };
};

const radioFor = (title: string) => screen.getByRole('radio', { name: (name) => name.includes(title) });

const alreadyScheduled = (badge: string, startDate: string) =>
  strings.formatString(strings.SCHEDULE_OBSERVATION_TYPE_ALREADY_SCHEDULED, badge, startDate) as string;

describe('MonitoringTypeSelector', () => {
  it('checks the option matching the selected monitoring type', () => {
    renderSelector('Biomass Measurements');

    expect(radioFor(strings.SCHEDULE_OBSERVATION_SURVIVAL_TITLE)).not.toBeChecked();
    expect(radioFor(strings.SCHEDULE_OBSERVATION_VEGETATION_TITLE)).toBeChecked();
  });

  it('disables a monitoring type that already has an upcoming observation and says when it starts', () => {
    renderSelector('Monitoring', { Monitoring: '2026-07-14' });

    expect(radioFor(strings.SCHEDULE_OBSERVATION_SURVIVAL_TITLE)).toBeDisabled();
    expect(radioFor(strings.SCHEDULE_OBSERVATION_SURVIVAL_TITLE)).not.toBeChecked();
    expect(screen.getByText(alreadyScheduled(strings.SURVIVAL_MONITORING, '2026-07-14'))).toBeInTheDocument();

    expect(radioFor(strings.SCHEDULE_OBSERVATION_VEGETATION_TITLE)).toBeEnabled();
    expect(screen.queryByText(alreadyScheduled(strings.VEGETATION_MONITORING, '2026-07-14'))).not.toBeInTheDocument();
  });

  it('reports the monitoring type the user picks', async () => {
    const { onChange, user } = renderSelector('Monitoring', { Monitoring: '2026-07-14' });

    await user.click(radioFor(strings.SCHEDULE_OBSERVATION_VEGETATION_TITLE));

    expect(onChange).toHaveBeenCalledWith('Biomass Measurements');
  });
});
