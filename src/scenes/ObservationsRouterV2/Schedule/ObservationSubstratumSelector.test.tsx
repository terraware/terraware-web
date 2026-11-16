import React from 'react';

import { rstest } from '@rstest/core';
import { act, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import { api } from 'src/queries/generated/plantingSites';
import ObservationSubstratumSelector from 'src/scenes/ObservationsRouterV2/Schedule/ObservationSubstratumSelector';
import { MonitoringType } from 'src/scenes/ObservationsRouterV2/Schedule/monitoringTypes';
import strings from 'src/strings';
import { buildPlantingSite, buildStratum, buildSubstratum, mockGet, renderWithProviders, server } from 'src/test-utils';

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
  it.each(['Baseline Survey', 'Monitoring', 'Biomass Measurements'] as const)(
    'keeps Select All in sync with individual and stratum selections for %s',
    async (monitoringType) => {
      mockGet(SITE_URL, { site });
      mockGet('/api/v1/tracking/sites/reportedPlants', { sites: [] });
      const { user } = renderWithProviders(
        <ObservationSubstratumSelector
          monitoringType={monitoringType}
          plantingSiteId={1}
          onChangeSelectedSubstrata={() => undefined}
          preselectBaselineSubstrata
        />
      );
      await screen.findByLabelText('Ewe Highlands');
      const selectAll = screen.getByLabelText(strings.SELECT_ALL);
      await waitFor(() => expect(selectAll).toBeChecked());
      for (const checkbox of [screen.getAllByLabelText('North')[0], screen.getByLabelText('Ewe Highlands')]) {
        expect(selectAll).toBeChecked();
        await user.click(checkbox);
        expect(selectAll).not.toBeChecked();
        await user.click(checkbox);
        expect(selectAll).toBeChecked();
        await user.click(checkbox);
        await user.click(selectAll);
        expect(selectAll).toBeChecked();
        expect(checkbox).toBeChecked();
        expect(screen.getAllByLabelText('South')[0]).toBeChecked();
      }
      await user.click(selectAll);
      expect(selectAll).not.toBeChecked();
      expect(screen.getByLabelText('Ewe Highlands')).not.toBeChecked();
    }
  );

  it('starts Baseline reschedules with all substrata selected even when Baselines exist', async () => {
    renderSelector(
      'Baseline Survey',
      buildPlantingSite({
        strata: [
          buildStratum({
            substrata: [
              buildSubstratum({ name: 'Covered', latestBaselineSurveyStatus: 'Completed' }),
              buildSubstratum({ id: 2, name: 'Uncovered' }),
            ],
          }),
        ],
      })
    );
    expect(await screen.findByLabelText('Covered')).toBeChecked();
    expect(screen.getByLabelText('Uncovered')).toBeChecked();
    expect(screen.getByLabelText(strings.SELECT_ALL)).toBeChecked();
  });

  it('preselects only uncovered Baseline substrata on type changes and preserves manual edits and refreshes', async () => {
    const baselineSite = {
      ...buildPlantingSite(),
      strata: [
        {
          ...buildStratum(),
          substrata: [
            { ...buildSubstratum({ id: 11, name: 'Uncovered' }), latestBaselineSurveyStatus: null },
            buildSubstratum({ id: 12, name: 'Absent' }),
            ...(['Upcoming', 'InProgress', 'Overdue', 'Completed', 'Abandoned'] as const).map((status, index) =>
              buildSubstratum({ id: index + 20, name: status, latestBaselineSurveyStatus: status })
            ),
          ],
        },
      ],
    };
    mockGet(SITE_URL, { site: baselineSite });
    mockGet('/api/v1/tracking/sites/reportedPlants', { sites: [] });
    const onChange = rstest.fn();
    const selector = (type: MonitoringType) => (
      <ObservationSubstratumSelector
        monitoringType={type}
        onChangeSelectedSubstrata={onChange}
        plantingSiteId={1}
        preselectBaselineSubstrata
      />
    );
    const { rerender, user, store } = renderWithProviders(selector('Monitoring'));
    expect(await screen.findByLabelText('Uncovered')).toBeChecked();
    await user.click(screen.getByLabelText('Completed'));
    rerender(selector('Baseline Survey'));
    await waitFor(() => expect(screen.getByLabelText('Uncovered')).toBeChecked());
    expect(screen.getByLabelText('Absent')).toBeChecked();
    for (const status of ['Upcoming', 'InProgress', 'Overdue', 'Completed', 'Abandoned']) {
      expect(screen.getByLabelText(status)).not.toBeChecked();
    }
    expect(onChange).toHaveBeenLastCalledWith([11, 12]);
    await user.click(screen.getByLabelText('Uncovered'));
    await user.click(screen.getByLabelText('Completed'));
    act(() => {
      store.dispatch(
        api.util.updateQueryData('getPlantingSite', { id: 1, includeZones: false }, (data) => {
          data.site.name = 'Refreshed';
        })
      );
    });
    expect(screen.getByLabelText('Uncovered')).not.toBeChecked();
    expect(screen.getByLabelText('Completed')).toBeChecked();
    for (const type of ['Monitoring', 'Biomass Measurements'] as const) {
      rerender(selector(type));
      expect(screen.getByLabelText('Uncovered')).not.toBeChecked();
      expect(screen.getByLabelText('Completed')).toBeChecked();
    }
    rerender(selector('Baseline Survey'));
    await waitFor(() => expect(screen.getByLabelText('Uncovered')).toBeChecked());
    expect(screen.getByLabelText('Completed')).not.toBeChecked();
  });

  it('waits for site data and reapplies Baseline defaults when the site changes', async () => {
    let finishLoading: () => void = () => undefined;
    const pending = new Promise<void>((resolve) => {
      finishLoading = resolve;
    });
    mockGet(SITE_URL, { site });
    mockGet('/api/v1/tracking/sites/reportedPlants', { sites: [] });
    server.use(
      http.get('/api/v1/tracking/sites/2', async () => {
        await pending;
        return HttpResponse.json({
          status: 'ok',
          site: buildPlantingSite({
            id: 2,
            strata: [
              buildStratum({
                substrata: [
                  buildSubstratum({ id: 31, name: 'New uncovered' }),
                  buildSubstratum({ id: 32, name: 'New covered', latestBaselineSurveyStatus: 'Completed' }),
                ],
              }),
            ],
          }),
        });
      })
    );
    const selector = (id: number) => (
      <ObservationSubstratumSelector
        monitoringType='Baseline Survey'
        onChangeSelectedSubstrata={() => undefined}
        plantingSiteId={id}
        preselectBaselineSubstrata
      />
    );
    const { rerender, user } = renderWithProviders(selector(1));
    await waitFor(() => expect(screen.getByLabelText(strings.SELECT_ALL)).toBeChecked());
    await user.click(screen.getByLabelText(strings.SELECT_ALL));
    rerender(selector(2));
    expect(screen.queryByLabelText('New uncovered')).not.toBeInTheDocument();
    finishLoading();
    await waitFor(() => expect(screen.getByLabelText('New uncovered')).toBeChecked());
    expect(screen.getByLabelText('New covered')).not.toBeChecked();
    await user.click(screen.getByLabelText(strings.SELECT_ALL));
    expect(screen.getByLabelText('New covered')).toBeChecked();
    await user.click(screen.getByLabelText(strings.SELECT_ALL));
    expect(screen.getByLabelText('New uncovered')).not.toBeChecked();
    rerender(selector(1));
    await waitFor(() => expect(screen.getByLabelText(strings.SELECT_ALL)).toBeChecked());
  });

  it('leaves every substratum unchecked when all Baselines already exist', async () => {
    mockGet(SITE_URL, {
      site: buildPlantingSite({
        strata: [
          buildStratum({ substrata: [buildSubstratum({ name: 'Covered', latestBaselineSurveyStatus: 'Abandoned' })] }),
        ],
      }),
    });
    mockGet('/api/v1/tracking/sites/reportedPlants', { sites: [] });
    const onChange = rstest.fn();
    renderWithProviders(
      <ObservationSubstratumSelector
        monitoringType='Baseline Survey'
        plantingSiteId={1}
        onChangeSelectedSubstrata={onChange}
        preselectBaselineSubstrata
      />
    );
    expect(await screen.findByLabelText('Covered')).not.toBeChecked();
    expect(screen.getByLabelText(strings.SELECT_ALL)).not.toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('does not preselect substrata when the planting site request fails', async () => {
    let requested = false;
    server.use(
      http.get(SITE_URL, () => {
        requested = true;
        return HttpResponse.json({ status: 'error' }, { status: 500 });
      })
    );
    mockGet('/api/v1/tracking/sites/reportedPlants', { sites: [] });
    const onChange = rstest.fn();
    renderWithProviders(
      <ObservationSubstratumSelector
        monitoringType='Baseline Survey'
        plantingSiteId={1}
        onChangeSelectedSubstrata={onChange}
        preselectBaselineSubstrata
      />
    );
    await waitFor(() => expect(requested).toBe(true));
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it.each(['loading', 'failed'])('omits planting tags while reported plantings are %s', async (state) => {
    mockGet(SITE_URL, { site });
    let finishLoading: () => void = () => undefined;
    const pending = new Promise<void>((resolve) => {
      finishLoading = resolve;
    });
    server.use(
      http.get('/api/v1/tracking/sites/reportedPlants', async () => {
        if (state === 'loading') {
          await pending;
        }
        return HttpResponse.json({ status: 'error' }, { status: 500 });
      })
    );
    renderWithProviders(
      <ObservationSubstratumSelector
        monitoringType='Baseline Survey'
        onChangeSelectedSubstrata={() => undefined}
        plantingSiteId={PLANTING_SITE_ID}
      />
    );
    expect(await screen.findByText('Ewe Highlands')).toBeVisible();
    expect(screen.queryByText(/Baseline:.*of/)).not.toBeInTheDocument();
    expect(screen.queryByText(/ · /)).not.toBeInTheDocument();
    expect(screen.queryByText(/Has plantings:.*of/)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.HAS_PLANTINGS)).not.toBeInTheDocument();
    finishLoading();
  });

  it('shows substratum tags without Baseline stratum summaries', async () => {
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
      await screen.findByText(strings.formatString(strings.BASELINE_COMPLETED_X, '2026-06-02') as string)
    ).toBeVisible();
    expect(screen.getByText(strings.formatString(strings.BASELINE_SCHEDULED_X, '2026-11-16') as string)).toBeVisible();
    expect(await screen.findByText(strings.HAS_PLANTINGS)).toBeVisible();
    expect(screen.queryByText(/Baseline:.*of/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Has plantings:.*of/)).not.toBeInTheDocument();
    expect(screen.queryByText(/ · /)).not.toBeInTheDocument();
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
    expect(await screen.findByText(strings.formatString(strings[label], '2026-06-02') as string)).toBeVisible();
    expect(screen.queryByText(strings.NO_OBSERVATIONS_HAVE_BEEN_SCHEDULED)).not.toBeInTheDocument();
  });

  it('omits summaries and tags when no Baselines or plantings exist', async () => {
    renderSelector('Baseline Survey');
    expect(await screen.findByText('Ewe Highlands')).toBeVisible();
    expect(screen.queryByText(/Baseline:.*of/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Has plantings:.*of/)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.NO_OBSERVATIONS_HAVE_BEEN_SCHEDULED)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.HAS_PLANTINGS)).not.toBeInTheDocument();
    expect(screen.getByText(strings.PLOTS)).toBeInTheDocument();
    expect(screen.getAllByText(approx(0))).toHaveLength(4);
  });

  it.each(['Monitoring', 'Biomass Measurements'] as const)(
    'keeps the legacy observation display for %s',
    async (type) => {
      renderSelector(type);
      expect(await screen.findAllByText(strings.NO_OBSERVATIONS_HAVE_BEEN_SCHEDULED)).toHaveLength(2);
      expect(screen.queryByText(strings.HAS_PLANTINGS)).not.toBeInTheDocument();
      expect(screen.queryByText(/Baseline:/)).not.toBeInTheDocument();
      expect(screen.getByText(strings.PERMANENT_PLOTS)).toBeInTheDocument();
      expect(screen.getByText(strings.TEMPORARY_PLOTS)).toBeInTheDocument();
      expect(screen.queryByText(strings.PLOTS)).not.toBeInTheDocument();
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
    expect(screen.getAllByText(/^~\d+$/).map((cell) => cell.textContent)).toEqual([
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

    await user.click(await screen.findByLabelText(strings.SELECT_ALL));
    await user.click(screen.getByLabelText('Ewe Highlands'));
    await user.click(screen.getAllByLabelText('North')[1]);

    // All of Ewe Highlands (7 and 5) plus Okuta Range's North (~2 and ~2).
    expect(screen.getByText(plotsAssigned(16, 7, 9))).toBeInTheDocument();
  });

  it('starts with every substratum selected, adding up to the stratum counts', async () => {
    renderSelector();

    expect(await screen.findByText(plotsAssigned(26, 13, 13))).toBeInTheDocument();
    expect(screen.getByLabelText('Ewe Highlands')).toBeChecked();
    screen.getAllByLabelText('North').forEach((checkbox) => expect(checkbox).toBeChecked());
    screen.getAllByLabelText('South').forEach((checkbox) => expect(checkbox).toBeChecked());
  });

  it('combines Baseline plot counts into one column and selected total', async () => {
    renderSelector('Baseline Survey', {
      ...site,
      strata: site.strata?.map((stratum, index) => ({
        ...stratum,
        plotCounts: [{ observationType: 'Baseline Survey', numPermanentPlots: 0, numTemporaryPlots: index ? 8 : 5 }],
      })),
    });

    expect(await screen.findByText(strings.PLOTS)).toBeInTheDocument();
    expect(screen.queryByText(strings.PERMANENT_PLOTS)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.TEMPORARY_PLOTS)).not.toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getAllByText(/^~\d+$/).map((cell) => cell.textContent)).toEqual([
      approx(3),
      approx(2),
      approx(2),
      approx(6),
    ]);

    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === 'P' &&
          element.textContent ===
            strings.formatString(
              strings.X_WILL_BE_ASSIGNED_FOR_THE_SELECTED_AREAS,
              strings.formatString(strings.X_PLOTS, approx(13)) as string
            )
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(plotsAssigned(13, 13, 0))).not.toBeInTheDocument();
  });

  it('shows no total once everything is deselected', async () => {
    const { user } = renderSelector();

    await user.click(await screen.findByLabelText(strings.SELECT_ALL));

    expect(screen.getByLabelText('Ewe Highlands')).not.toBeChecked();
    expect(screen.queryByText(plotsAssigned(0, 0, 0))).not.toBeInTheDocument();
  });

  it('shows the plot counts and estimates of the monitoring type being scheduled', async () => {
    renderSelector('Biomass Measurements');

    expect(await screen.findByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.queryByText('7')).not.toBeInTheDocument();
    expect(screen.queryByText('6')).not.toBeInTheDocument();
    expect(screen.getByText(plotsAssigned(28, 16, 12))).toBeInTheDocument();
  });

  it('shows no plots for a monitoring type the strata have no counts for', async () => {
    renderSelector(
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
    expect(screen.getByText(plotsAssigned(0, 0, 0))).toBeInTheDocument();
  });
});
