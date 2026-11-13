import React from 'react';

import { screen } from '@testing-library/react';

import ObservationSubstratumSelector from 'src/scenes/ObservationsRouterV2/Schedule/ObservationSubstratumSelector';
import { MonitoringType } from 'src/scenes/ObservationsRouterV2/Schedule/monitoringTypes';
import strings from 'src/strings';
import { buildPlantingSite, buildStratum, buildSubstratum, mockGet, renderWithProviders } from 'src/test-utils';

const PLANTING_SITE_ID = 1;
const SITE_URL = `/api/v1/tracking/sites/${PLANTING_SITE_ID}`;

// Okuta Range's substrata are deliberately uneven, so its estimates are not just a halved count.
const site = buildPlantingSite({
  strata: [
    buildStratum({
      id: 1,
      name: 'Ewe Highlands',
      plotCounts: [
        { numPermanentPlots: 7, numTemporaryPlots: 5, observationType: 'Monitoring' },
        { numPermanentPlots: 3, numTemporaryPlots: 4, observationType: 'Biomass Measurements' },
      ],
      substrata: [
        buildSubstratum({ areaHa: 10, id: 11, name: 'North' }),
        buildSubstratum({ areaHa: 10, id: 12, name: 'South' }),
      ],
    }),
    buildStratum({
      id: 2,
      name: 'Okuta Range',
      plotCounts: [
        { numPermanentPlots: 6, numTemporaryPlots: 8, observationType: 'Monitoring' },
        { numPermanentPlots: 9, numTemporaryPlots: 12, observationType: 'Biomass Measurements' },
      ],
      substrata: [
        buildSubstratum({ areaHa: 5, id: 21, name: 'North' }),
        buildSubstratum({ areaHa: 15, id: 22, name: 'South' }),
      ],
    }),
  ],
});

const renderSelector = (
  monitoringType: MonitoringType = 'Monitoring',
  sitePayload: unknown = site,
  plants: unknown[] = []
) => {
  mockGet(SITE_URL, { site: sitePayload });
  mockGet('/api/v1/tracking/sites/reportedPlants', { sites: plants });

  return renderWithProviders(
    <ObservationSubstratumSelector
      monitoringType={monitoringType}
      onChangeSelectedSubstrata={() => undefined}
      plantingSiteId={PLANTING_SITE_ID}
    />
  );
};

const approx = (count: number) => `${strings.APPROX_SYMBOL}${count}`;

/**
 * The plot total is assembled from several nodes so the count can be bold, which the default text
 * matcher can't see; match on the paragraph's whole text instead.
 */
const plotsAssigned = (total: number, temporary: number, permanent: number) => {
  const text = strings.formatString(
    strings.SCHEDULE_OBSERVATION_PLOTS_ASSIGNED,
    strings.formatString(total === 1 ? strings.X_PLOT : strings.X_PLOTS, approx(total)) as string,
    approx(temporary),
    approx(permanent)
  ) as string;

  return (_: string, element: Element | null) => element?.tagName === 'P' && element.textContent === text;
};

describe('ObservationSubstratumSelector', () => {
  it('shows Baseline coverage and plantings from the latest per-substratum site fields', async () => {
    const baselineSite = {
      ...site,
      strata: site.strata?.map((stratum, index) => ({
        ...stratum,
        substrata: stratum.substrata.map((substratum, substratumIndex) => ({
          ...substratum,
          ...(index === 0
            ? {
                latestBaselineSurveyDate: substratumIndex === 0 ? '2026-06-02' : '2026-11-16',
                latestBaselineSurveyId: substratumIndex + 1,
                latestBaselineSurveyStatus: substratumIndex === 0 ? ('Completed' as const) : ('Upcoming' as const),
              }
            : {}),
        })),
      })),
    };
    renderSelector('Baseline Survey', baselineSite, [
      {
        id: 1,
        strata: [
          {
            substrata: [
              { id: 21, totalPlants: 10 },
              { id: 22, totalPlants: 0 },
            ],
          },
        ],
      },
    ]);
    expect(
      await screen.findByText(strings.formatString(strings.BASELINE_X_OF_Y_HAS_PLANTINGS_X_OF_Y, 2, 2, 0, 2) as string)
    ).toBeVisible();
    expect(
      await screen.findByText(strings.formatString(strings.BASELINE_X_OF_Y_HAS_PLANTINGS_X_OF_Y, 0, 2, 1, 2) as string)
    ).toBeVisible();
    expect(screen.getByText(strings.formatString(strings.BASELINE_COMPLETED_X, '2026-06-02') as string)).toBeVisible();
    expect(screen.getByText(strings.formatString(strings.BASELINE_SCHEDULED_X, '2026-11-16') as string)).toBeVisible();
    expect(screen.getByText(strings.HAS_PLANTINGS)).toBeVisible();
    expect(screen.queryByText(strings.NO_OBSERVATIONS_HAVE_BEEN_SCHEDULED)).not.toBeInTheDocument();
  });

  it.each([
    ['Completed', 'BASELINE_COMPLETED_X'],
    ['Abandoned', 'BASELINE_COMPLETED_X'],
    ['Upcoming', 'BASELINE_SCHEDULED_X'],
    ['InProgress', 'BASELINE_SCHEDULED_X'],
    ['Overdue', 'BASELINE_OVERDUE_X'],
  ] as const)('shows %s Baselines with the matching status pill', async (status, label) => {
    renderSelector('Baseline Survey', {
      ...site,
      strata: [
        {
          ...site.strata![0],
          substrata: [
            {
              ...site.strata![0].substrata[0],
              latestBaselineSurveyDate: '2026-06-02',
              latestBaselineSurveyId: 1,
              latestBaselineSurveyStatus: status,
            },
            {
              ...site.strata![0].substrata[1],
              latestBaselineSurveyDate: null,
              latestBaselineSurveyId: null,
              latestBaselineSurveyStatus: null,
            },
          ],
        },
      ],
    });
    expect(
      await screen.findByText(strings.formatString(strings.BASELINE_X_OF_Y_HAS_PLANTINGS_X_OF_Y, 1, 2, 0, 2) as string)
    ).toBeVisible();
    expect(screen.getByText(strings.formatString(strings[label], '2026-06-02') as string)).toBeVisible();
    expect(screen.queryByText(strings.NO_OBSERVATIONS_HAVE_BEEN_SCHEDULED)).not.toBeInTheDocument();
  });

  it('shows zero coverage without legacy observation text when no Baselines or plantings exist', async () => {
    renderSelector('Baseline Survey');
    expect(
      await screen.findAllByText(
        strings.formatString(strings.BASELINE_X_OF_Y_HAS_PLANTINGS_X_OF_Y, 0, 2, 0, 2) as string
      )
    ).toHaveLength(2);
    expect(screen.queryByText(strings.NO_OBSERVATIONS_HAVE_BEEN_SCHEDULED)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.HAS_PLANTINGS)).not.toBeInTheDocument();
  });

  it.each(['Monitoring', 'Biomass Measurements'] as const)(
    'keeps the legacy observation display for %s',
    async (type) => {
      renderSelector(type);
      expect(await screen.findAllByText(strings.NO_OBSERVATIONS_HAVE_BEEN_SCHEDULED)).toHaveLength(2);
      expect(screen.queryByText(strings.HAS_PLANTINGS)).not.toBeInTheDocument();
      expect(screen.queryByText(/Baseline:/)).not.toBeInTheDocument();
    }
  );

  it('shows each stratum its plot counts and each substratum an estimate', async () => {
    renderSelector();

    expect(await screen.findByText(strings.PERMANENT_PLOTS)).toBeInTheDocument();
    expect(screen.getByText(strings.TEMPORARY_PLOTS)).toBeInTheDocument();

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();

    // Permanent then temporary for each substratum in turn: Ewe Highlands splits 7 and 5 evenly,
    // Okuta Range splits 6 and 8 a quarter to North and three quarters to South.
    expect(screen.getAllByText(/^~/).map((cell) => cell.textContent)).toEqual([
      approx(4),
      approx(3),
      approx(3),
      approx(2),
      approx(2),
      approx(2),
      approx(4),
      approx(6),
    ]);
  });

  it('totals the estimates of the selected substrata', async () => {
    const { user } = renderSelector();

    await user.click(await screen.findByLabelText('Ewe Highlands'));
    await user.click(screen.getAllByLabelText('North')[1]);

    // All of Ewe Highlands (7 and 5) plus Okuta Range's North (~2 and ~2).
    expect(screen.getByText(plotsAssigned(16, 7, 9))).toBeInTheDocument();
  });

  it('adds up to the stratum counts when every substratum is selected', async () => {
    const { user } = renderSelector();

    await user.click(await screen.findByLabelText(strings.SELECT_ALL));

    expect(screen.getByText(plotsAssigned(26, 13, 13))).toBeInTheDocument();
  });

  it('shows no total before anything is selected', async () => {
    renderSelector();

    expect(await screen.findByLabelText('Ewe Highlands')).toBeInTheDocument();
    expect(screen.queryByText(plotsAssigned(0, 0, 0))).not.toBeInTheDocument();
  });

  it('shows the plot counts and estimates of the monitoring type being scheduled', async () => {
    const { user } = renderSelector('Biomass Measurements');

    expect(await screen.findByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.queryByText('7')).not.toBeInTheDocument();
    expect(screen.queryByText('6')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText(strings.SELECT_ALL));

    expect(screen.getByText(plotsAssigned(28, 16, 12))).toBeInTheDocument();
  });

  it('shows no plots for a monitoring type the strata have no counts for', async () => {
    const { user } = renderSelector(
      'Biomass Measurements',
      buildPlantingSite({
        strata: [
          buildStratum({
            id: 1,
            name: 'Ewe Highlands',
            plotCounts: [{ numPermanentPlots: 7, numTemporaryPlots: 5, observationType: 'Monitoring' }],
            substrata: [buildSubstratum({ id: 11, name: 'North' })],
          }),
        ],
      })
    );

    expect(await screen.findByLabelText('Ewe Highlands')).toBeInTheDocument();
    expect(screen.queryByText('7')).not.toBeInTheDocument();
    expect(screen.queryByText('5')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText(strings.SELECT_ALL));

    expect(screen.getByText(plotsAssigned(0, 0, 0))).toBeInTheDocument();
  });
});
