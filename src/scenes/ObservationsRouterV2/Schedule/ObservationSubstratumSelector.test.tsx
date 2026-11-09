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

const renderSelector = (monitoringType: MonitoringType = 'Monitoring', sitePayload = site) => {
  mockGet(SITE_URL, { site: sitePayload });

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
