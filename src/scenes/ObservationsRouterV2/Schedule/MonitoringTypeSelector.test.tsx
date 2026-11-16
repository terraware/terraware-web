import React from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import { DateTime } from 'luxon';

import MonitoringTypeSelector from 'src/scenes/ObservationsRouterV2/Schedule/MonitoringTypeSelector';
import ScheduleObservationForm from 'src/scenes/ObservationsRouterV2/Schedule/ScheduleObservationForm';
import { MonitoringType } from 'src/scenes/ObservationsRouterV2/Schedule/monitoringTypes';
import { UpcomingObservationStartDates } from 'src/scenes/ObservationsRouterV2/Schedule/useObservablePlantingSites';
import strings from 'src/strings';
import {
  buildPlantingSite,
  buildStratum,
  buildSubstratum,
  buildUser,
  captureRequests,
  mockGet,
  renderWithProviders,
} from 'src/test-utils';

const renderSelector = (
  selectedMonitoringType: MonitoringType,
  upcomingObservationStartDates: UpcomingObservationStartDates = {},
  hasPlantings = true,
  baselineSurveyObservations = false,
  scheduledBiomassMonitoringObservations = true
) => {
  const onChange = rstest.fn();
  const preferenceRequests = captureRequests('get', '/api/v1/users/me/preferences', {
    preferences: { baselineSurveyObservations, scheduledBiomassMonitoringObservations },
  });
  mockGet('/api/v1/users/me', { user: buildUser() });

  const { user } = renderWithProviders(
    <MonitoringTypeSelector
      hasPlantings={hasPlantings}
      onChange={onChange}
      selectedMonitoringType={selectedMonitoringType}
      upcomingObservationStartDates={upcomingObservationStartDates}
    />
  );

  return { onChange, preferenceRequests, user };
};

const radioFor = (title: string) => screen.getByRole('radio', { name: (name) => name.includes(title) });

const alreadyScheduled = (badge: string, startDate: string) =>
  strings.formatString(strings.SCHEDULE_OBSERVATION_TYPE_ALREADY_SCHEDULED, badge, startDate) as string;

describe('MonitoringTypeSelector', () => {
  it('checks the option matching the selected monitoring type', async () => {
    renderSelector('Biomass Measurements', {}, true, true);

    expect(await screen.findByText(strings.MEASURE_MY_SITE_BEFORE_PLANTING)).toBeInTheDocument();
    expect(radioFor(strings.MEASURE_MY_SITE_BEFORE_PLANTING)).not.toBeChecked();
    expect(radioFor(strings.SCHEDULE_OBSERVATION_PLANT_MONITORING_TITLE)).not.toBeChecked();
    expect(radioFor(strings.SCHEDULE_OBSERVATION_BIOMASS_MONITORING_TITLE)).toBeChecked();
  });

  it('disables a monitoring type that already has an upcoming observation and says when it starts', () => {
    renderSelector('Monitoring', { Monitoring: '2026-07-14' });

    expect(radioFor(strings.SCHEDULE_OBSERVATION_PLANT_MONITORING_TITLE)).toBeDisabled();
    expect(radioFor(strings.SCHEDULE_OBSERVATION_PLANT_MONITORING_TITLE)).not.toBeChecked();
    expect(screen.getByText(alreadyScheduled(strings.PLANT_MONITORING, '2026-07-14'))).toBeInTheDocument();

    expect(radioFor(strings.SCHEDULE_OBSERVATION_BIOMASS_MONITORING_TITLE)).toBeEnabled();
    expect(screen.queryByText(alreadyScheduled(strings.BIOMASS_MONITORING, '2026-07-14'))).not.toBeInTheDocument();
  });

  it('disables every monitoring type when the planting site has no plantings', () => {
    renderSelector('Monitoring', {}, false);

    expect(radioFor(strings.SCHEDULE_OBSERVATION_PLANT_MONITORING_TITLE)).toBeDisabled();
    expect(radioFor(strings.SCHEDULE_OBSERVATION_PLANT_MONITORING_TITLE)).not.toBeChecked();
    expect(radioFor(strings.SCHEDULE_OBSERVATION_BIOMASS_MONITORING_TITLE)).toBeDisabled();
    expect(screen.getAllByText(strings.SCHEDULE_OBSERVATION_TYPE_REQUIRES_PLANTINGS)).toHaveLength(2);
  });

  it.each(['Biomass Measurements', 'Baseline Survey'] as const)(
    'reports the monitoring type %s the user picks',
    async (type) => {
      const { onChange, user } = renderSelector('Monitoring', { Monitoring: '2026-07-14' }, true, true);

      const title =
        type === 'Baseline Survey'
          ? strings.MEASURE_MY_SITE_BEFORE_PLANTING
          : strings.SCHEDULE_OBSERVATION_BIOMASS_MONITORING_TITLE;
      await user.click(await screen.findByRole('radio', { name: (name) => name.includes(title) }));

      expect(onChange).toHaveBeenCalledWith(type);
    }
  );

  it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ])(
    'offers baseline based only on its feature flag (baseline=%s, biomass=%s)',
    async (baselineEnabled, biomassEnabled) => {
      const { preferenceRequests } = renderSelector('Monitoring', {}, true, baselineEnabled, biomassEnabled);
      await waitFor(() => expect(preferenceRequests).toHaveLength(1));
      if (baselineEnabled) {
        expect(await screen.findByText(strings.MEASURE_MY_SITE_BEFORE_PLANTING)).toBeInTheDocument();
      } else {
        expect(screen.queryByText(strings.MEASURE_MY_SITE_BEFORE_PLANTING)).not.toBeInTheDocument();
      }
    }
  );

  it('allows baseline without plantings even when another baseline is upcoming', async () => {
    renderSelector('Baseline Survey', { 'Baseline Survey': '2026-07-14' }, false, true);

    expect(await screen.findByText(strings.MEASURE_MY_SITE_BEFORE_PLANTING)).toBeInTheDocument();
    expect(radioFor(strings.MEASURE_MY_SITE_BEFORE_PLANTING)).toBeEnabled();
    expect(radioFor(strings.MEASURE_MY_SITE_BEFORE_PLANTING)).toBeChecked();
    expect(screen.getAllByText(strings.SCHEDULE_OBSERVATION_TYPE_REQUIRES_PLANTINGS)).toHaveLength(2);
    expect(screen.queryByText(alreadyScheduled(strings.BASELINE_SURVEY, '2026-07-14'))).not.toBeInTheDocument();
  });
});

const renderScheduleForm = (
  hasPlantings = false,
  blockMonitoring = false,
  blockBiomass = false,
  substrata?: ReturnType<typeof buildSubstratum>[],
  areaHa = 10
) => {
  const site = buildPlantingSite({
    areaHa,
    strata: [
      buildStratum({
        plotCounts: [{ observationType: 'Baseline Survey', numPermanentPlots: 0, numTemporaryPlots: 4 }],
        ...(substrata ? { substrata } : {}),
      }),
    ],
  });
  const startDate = DateTime.now().plus({ days: 7 }).toISODate()!;
  const endDate = DateTime.now().plus({ days: 14 }).toISODate()!;
  mockGet('/api/v1/users/me/preferences', {
    preferences: { baselineSurveyObservations: true, scheduledBiomassMonitoringObservations: true },
  });
  mockGet('/api/v1/users/me', { user: buildUser() });
  mockGet('/api/v1/tracking/sites', { sites: [site] });
  mockGet('/api/v1/tracking/sites/1', { site });
  mockGet('/api/v1/tracking/sites/reportedPlants', {
    sites: [{ id: site.id, strata: [{ substrata: [{ totalPlants: hasPlantings ? 10 : 0 }] }] }],
  });
  const observation = { endDate, plantingSiteId: site.id, startDate, state: 'Upcoming' };
  mockGet('/api/v1/tracking/observations', {
    observations: [
      ...['Upcoming', 'InProgress', 'Completed'].map((state, id) => ({
        ...observation,
        id: id + 1,
        state,
        type: 'Baseline Survey',
      })),
      ...(blockMonitoring ? [{ ...observation, id: 4, type: 'Monitoring' }] : []),
      ...(blockBiomass ? [{ ...observation, id: 5, type: 'Biomass Measurements' }] : []),
    ],
  });
  const onSchedule = rstest.fn();
  const result = renderWithProviders(
    <ScheduleObservationForm title={strings.SCHEDULE_OBSERVATION} onCancel={() => undefined} onSchedule={onSchedule} />
  );
  return { ...result, endDate, onSchedule, startDate };
};

describe('baseline scheduling form', () => {
  it.each([false, true])('only offers sites with strata when biomass scheduling is %s', async (enabled) => {
    const sites = [
      buildPlantingSite({ id: 1, name: 'No strata', strata: [] }),
      buildPlantingSite({ id: 2, name: 'With strata' }),
      buildPlantingSite({ id: 3, name: 'Another site with strata' }),
    ];
    mockGet('/api/v1/users/me/preferences', {
      preferences: { baselineSurveyObservations: true, scheduledBiomassMonitoringObservations: enabled },
    });
    mockGet('/api/v1/users/me', { user: buildUser() });
    mockGet('/api/v1/tracking/sites', { sites });
    mockGet('/api/v1/tracking/sites/reportedPlants', {
      sites: sites.map((site) => ({ id: site.id, strata: [{ substrata: [{ totalPlants: 10 }] }] })),
    });
    mockGet('/api/v1/tracking/observations', { observations: [] });
    const { user } = renderWithProviders(
      <ScheduleObservationForm title={strings.SCHEDULE_OBSERVATION} onCancel={() => undefined} />
    );

    await user.click(document.querySelector('#site input')!);
    const options = within(await screen.findByRole('list'));
    expect(await options.findByText('With strata')).toBeInTheDocument();
    expect(options.getByText('Another site with strata')).toBeInTheDocument();
    expect(options.queryByText('No strata')).not.toBeInTheDocument();
  });

  it.each([false, true])(
    'schedules baseline without overlapping substrata and hasPlantings=%s',
    async (hasPlantings) => {
      const { endDate, onSchedule, startDate, user } = renderScheduleForm(hasPlantings);
      await user.click(
        await screen.findByRole('radio', { name: (name) => name.includes(strings.MEASURE_MY_SITE_BEFORE_PLANTING) })
      );
      expect(radioFor(strings.MEASURE_MY_SITE_BEFORE_PLANTING)).toBeChecked();
      expect(screen.getByRole('button', { name: strings.SAVE })).toBeEnabled();

      await user.click(screen.getByRole('button', { name: strings.SAVE }));
      expect(screen.getAllByText(strings.REQUIRED_FIELD).length).toBeGreaterThan(0);
      expect(onSchedule).not.toHaveBeenCalled();

      for (const [label, date] of [
        [strings.OBSERVATION_START_DATE, startDate],
        [strings.OBSERVATION_END_DATE, endDate],
      ]) {
        await user.click(screen.getByLabelText(label));
        await user.keyboard('{Control>}a{/Control}');
        await user.paste(date);
      }
      await user.click(screen.getByRole('button', { name: strings.SAVE }));
      expect(screen.getByText(strings.SELECT_AT_LEAST_ONE_SUBSTRATUM)).toBeInTheDocument();
      expect(onSchedule).not.toHaveBeenCalled();

      await user.click(screen.getByLabelText(strings.SELECT_ALL));
      await user.click(screen.getByRole('button', { name: strings.SAVE }));
      expect(screen.queryByText(strings.SOME_SUBSTRATA_ALREADY_HAVE_A_BASELINE)).not.toBeInTheDocument();
      expect(onSchedule).toHaveBeenCalledWith({
        endDate,
        observationType: 'Baseline Survey',
        plantingSiteId: 1,
        requestedSubstratumIds: [1],
        startDate,
      });
    }
  );

  it.each([
    ['Completed', 'X_COMPLETED_Y'],
    ['Abandoned', 'X_COMPLETED_Y'],
    ['Upcoming', 'X_SCHEDULED_Y'],
    ['InProgress', 'X_SCHEDULED_Y'],
    ['Overdue', 'X_OVERDUE_Y'],
  ] as const)('warns only about selected substrata with %s baselines after validation', async (status, label) => {
    const { endDate, onSchedule, startDate, user } = renderScheduleForm(false, false, false, [
      buildSubstratum({
        id: 11,
        name: 'A',
        fullName: 'East A',
        latestBaselineSurveyStatus: status,
        latestBaselineSurveyDate: '2026-06-02',
      }),
      buildSubstratum({
        id: 12,
        name: 'B',
        fullName: 'East B',
        latestBaselineSurveyStatus: 'Upcoming',
        latestBaselineSurveyDate: '2026-11-16',
      }),
      buildSubstratum({ id: 13, name: 'C', fullName: 'East C' }),
    ]);
    await user.click(
      await screen.findByRole('radio', { name: (name) => name.includes(strings.MEASURE_MY_SITE_BEFORE_PLANTING) })
    );
    await user.click(await screen.findByLabelText('A'));
    await user.click(screen.getByLabelText('C'));
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    expect(screen.getAllByText(strings.REQUIRED_FIELD).length).toBeGreaterThan(0);
    expect(screen.queryByText(strings.SOME_SUBSTRATA_ALREADY_HAVE_A_BASELINE)).not.toBeInTheDocument();
    expect(onSchedule).not.toHaveBeenCalled();

    for (const [dateLabel, date] of [
      [strings.OBSERVATION_START_DATE, startDate],
      [strings.OBSERVATION_END_DATE, endDate],
    ]) {
      await user.click(screen.getByLabelText(dateLabel));
      await user.keyboard('{Control>}a{/Control}');
      await user.paste(date);
    }
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    expect(await screen.findByText(strings.SOME_SUBSTRATA_ALREADY_HAVE_A_BASELINE)).toBeVisible();
    expect(
      screen.getByText(strings.THESE_SUBSTRATA_ARE_ALREADY_INCLUDED_IN_A_COMPLETED_OR_SCHEDULED_BASELINE_SURVEY)
    ).toBeVisible();
    expect(screen.getByText(strings.formatString(strings[label], 'East A', '2026-06-02') as string)).toBeVisible();
    expect(screen.queryByText(/East B/)).not.toBeInTheDocument();
    expect(screen.queryByText(/East C/)).not.toBeInTheDocument();
    expect(screen.getByText(strings.DO_YOU_WANT_TO_SCHEDULE_ANOTHER_BASELINE_FOR_THEM)).toBeVisible();
    expect(onSchedule).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: strings.GO_BACK }));
    await waitFor(() =>
      expect(screen.queryByText(strings.SOME_SUBSTRATA_ALREADY_HAVE_A_BASELINE)).not.toBeInTheDocument()
    );
    expect(onSchedule).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    await user.click(await screen.findByRole('button', { name: strings.SCHEDULE_ANYWAY }));
    expect(onSchedule).toHaveBeenCalledWith({
      endDate,
      observationType: 'Baseline Survey',
      plantingSiteId: 1,
      requestedSubstratumIds: [11, 13],
      startDate,
    });
  });

  it.each([
    ['Monitoring', 'SCHEDULE_OBSERVATION_PLANT_MONITORING_TITLE'],
    ['Biomass Measurements', 'SCHEDULE_OBSERVATION_BIOMASS_MONITORING_TITLE'],
  ] as const)('does not warn about existing baselines when scheduling %s', async (type, title) => {
    const { endDate, onSchedule, startDate, user } = renderScheduleForm(true, false, false, [
      buildSubstratum({ latestBaselineSurveyStatus: 'Completed', latestBaselineSurveyDate: '2026-06-02' }),
    ]);
    await user.click(await screen.findByRole('radio', { name: (name) => name.includes(strings[title]) }));
    await user.click(await screen.findByLabelText(strings.SELECT_ALL));
    for (const [label, date] of [
      [strings.OBSERVATION_START_DATE, startDate],
      [strings.OBSERVATION_END_DATE, endDate],
    ]) {
      await user.click(screen.getByLabelText(label));
      await user.keyboard('{Control>}a{/Control}');
      await user.paste(date);
    }
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    expect(screen.queryByText(strings.SOME_SUBSTRATA_ALREADY_HAVE_A_BASELINE)).not.toBeInTheDocument();
    expect(onSchedule).toHaveBeenCalledWith({
      endDate,
      observationType: type,
      plantingSiteId: 1,
      requestedSubstratumIds: [1],
      startDate,
    });
  });

  it('requires the baseline confirmation after the small-site warning', async () => {
    const { endDate, onSchedule, startDate, user } = renderScheduleForm(
      false,
      false,
      false,
      [buildSubstratum({ latestBaselineSurveyStatus: 'Completed', latestBaselineSurveyDate: '2026-06-02' })],
      2
    );
    await user.click(
      await screen.findByRole('radio', { name: (name) => name.includes(strings.MEASURE_MY_SITE_BEFORE_PLANTING) })
    );
    await user.click(await screen.findByLabelText(strings.SELECT_ALL));
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    expect(screen.queryByText(strings.OBSERVATION_SMALL_SITE_WARNING)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.SOME_SUBSTRATA_ALREADY_HAVE_A_BASELINE)).not.toBeInTheDocument();
    for (const [label, date] of [
      [strings.OBSERVATION_START_DATE, startDate],
      [strings.OBSERVATION_END_DATE, endDate],
    ]) {
      await user.click(screen.getByLabelText(label));
      await user.keyboard('{Control>}a{/Control}');
      await user.paste(date);
    }
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    expect(await screen.findByText(strings.OBSERVATION_SMALL_SITE_WARNING)).toBeVisible();
    const saveButtons = screen.getAllByRole('button', { name: strings.SAVE });
    await user.click(saveButtons[saveButtons.length - 1]);
    expect(await screen.findByText(strings.SOME_SUBSTRATA_ALREADY_HAVE_A_BASELINE)).toBeVisible();
    expect(onSchedule).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: strings.SCHEDULE_ANYWAY }));
    expect(onSchedule).toHaveBeenCalledWith({
      endDate,
      observationType: 'Baseline Survey',
      plantingSiteId: 1,
      requestedSubstratumIds: [1],
      startDate,
    });
  });

  it.each([false, true])(
    'keeps baseline out of automatic fallback when biomass is blocked=%s',
    async (blockBiomass) => {
      renderScheduleForm(true, true, blockBiomass);
      expect(await screen.findByText(strings.MEASURE_MY_SITE_BEFORE_PLANTING)).toBeInTheDocument();
      expect(radioFor(strings.MEASURE_MY_SITE_BEFORE_PLANTING)).not.toBeChecked();
      expect(radioFor(strings.SCHEDULE_OBSERVATION_PLANT_MONITORING_TITLE)).toBeDisabled();
      if (blockBiomass) {
        expect(radioFor(strings.SCHEDULE_OBSERVATION_BIOMASS_MONITORING_TITLE)).toBeDisabled();
        expect(screen.getByRole('button', { name: strings.SAVE })).toBeDisabled();
      } else {
        await waitFor(() => expect(radioFor(strings.SCHEDULE_OBSERVATION_BIOMASS_MONITORING_TITLE)).toBeChecked());
      }
    }
  );
});
