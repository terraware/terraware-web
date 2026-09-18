import React from 'react';

import { rstest } from '@rstest/core';
import { waitFor } from '@testing-library/react';

import type { BarChartProps } from 'src/components/common/Chart/BarChart';
import type { ChartData, ChartDataset } from 'src/components/common/Chart/Chart';
import PlantingDensityPerStratumCard from 'src/scenes/PlantsDashboardRouter/components/PlantingDensityPerStratumCard';
import strings from 'src/strings';
import {
  buildPlantingSite,
  buildSiteObservationStats,
  buildStratum,
  buildStratumStats,
  buildSubstratum,
  mockGet,
  renderWithProviders,
} from 'src/test-utils';

// jsdom cannot paint Chart.js, so assert on the data the card hands to BarChart.
const chartRenders = rstest.hoisted(() => [] as (ChartData | undefined)[]);

rstest.mock('src/components/common/Chart/BarChart', () => ({
  __esModule: true,
  default: ({ chartData }: BarChartProps) => {
    chartRenders.push(chartData);
    return null;
  },
}));

const PLANTING_SITE_ID = 1;
const SITE_URL = `/api/v1/tracking/sites/${PLANTING_SITE_ID}`;
const STATS_URL = '/api/v1/tracking/observations/results/stats';

const NORTH = buildStratum({
  id: 10,
  name: 'North',
  targetPlantDensity: 1500,
  substrata: [buildSubstratum({ id: 100 })],
});
const SOUTH = buildStratum({
  id: 20,
  name: 'South',
  targetPlantDensity: 800,
  substrata: [buildSubstratum({ id: 200 })],
});

const mockSite = () => {
  mockGet(SITE_URL, { site: buildPlantingSite({ id: PLANTING_SITE_ID, strata: [NORTH, SOUTH] }) });
};

const mockStats = (strata: ReturnType<typeof buildStratumStats>[]) => {
  mockGet(STATS_URL, { stats: buildSiteObservationStats({ plantingSiteId: PLANTING_SITE_ID, strata }) });
};

const latestChart = () => chartRenders[chartRenders.length - 1];
const datasetFor = (label: string): ChartDataset | undefined =>
  latestChart()?.datasets.find((dataset) => dataset.label === label);

describe('PlantingDensityPerStratumCard', () => {
  beforeEach(() => {
    chartRenders.length = 0;
  });

  it('fills each bar from the observation that stratum was last observed in', async () => {
    mockSite();
    // South's density comes from an older observation than North's.
    mockStats([
      buildStratumStats({
        stratumId: NORTH.id,
        observationId: 2,
        completedTime: '2026-06-01T00:00:00Z',
        plantingDensity: 1200,
      }),
      buildStratumStats({
        stratumId: SOUTH.id,
        observationId: 1,
        completedTime: '2026-01-01T00:00:00Z',
        plantingDensity: 900,
      }),
    ]);

    renderWithProviders(<PlantingDensityPerStratumCard plantingSiteId={PLANTING_SITE_ID} />);

    await waitFor(() => expect(datasetFor(strings.PLANT_DENSITY)?.values).toEqual([1200, 900]));
    expect(latestChart()?.labels).toEqual(['North', 'South']);
    expect(datasetFor(strings.TARGET_DENSITY)?.values).toEqual([
      [1500, 1500],
      [800, 800],
    ]);
  });

  it('keeps the target bar for a stratum that has never been observed', async () => {
    mockSite();
    mockStats([
      buildStratumStats({ stratumId: NORTH.id, plantingDensity: 1200 }),
      buildStratumStats({
        stratumId: SOUTH.id,
        observationId: undefined,
        completedTime: undefined,
        plantingDensity: undefined,
      }),
    ]);

    renderWithProviders(<PlantingDensityPerStratumCard plantingSiteId={PLANTING_SITE_ID} />);

    await waitFor(() => expect(datasetFor(strings.PLANT_DENSITY)?.values).toEqual([1200, null]));
    expect(datasetFor(strings.TARGET_DENSITY)?.values).toEqual([
      [1500, 1500],
      [800, 800],
    ]);
  });

  it('omits the density dataset entirely when nothing has been observed', async () => {
    mockSite();
    mockStats([
      buildStratumStats({ stratumId: NORTH.id, observationId: undefined, plantingDensity: undefined }),
      buildStratumStats({ stratumId: SOUTH.id, observationId: undefined, plantingDensity: undefined }),
    ]);

    renderWithProviders(<PlantingDensityPerStratumCard plantingSiteId={PLANTING_SITE_ID} />);

    await waitFor(() => expect(latestChart()?.labels).toEqual(['North', 'South']));
    expect(datasetFor(strings.PLANT_DENSITY)).toBeUndefined();
    expect(datasetFor(strings.TARGET_DENSITY)).toBeDefined();
  });
});
