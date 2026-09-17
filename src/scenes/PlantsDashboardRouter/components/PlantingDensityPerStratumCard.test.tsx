import React from 'react';

import { rstest } from '@rstest/core';
import { waitFor } from '@testing-library/react';

import type { BarChartProps } from 'src/components/common/Chart/BarChart';
import type { ChartData, ChartDataset } from 'src/components/common/Chart/Chart';
import PlantingDensityPerStratumCard from 'src/scenes/PlantsDashboardRouter/components/PlantingDensityPerStratumCard';
import strings from 'src/strings';
import {
  buildPlantingSite,
  buildStratum,
  buildSubstratum,
  mockGet,
  mockPost,
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
const SEARCH_URL = '/api/v1/search';

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

const mockPlantingSite = () => {
  mockGet(SITE_URL, { site: buildPlantingSite({ id: PLANTING_SITE_ID, strata: [NORTH, SOUTH] }) });
};

const searchRow = (stratumId: number, observationId: number, completedTime: string, plantDensity: number) => ({
  stratum_id: `${stratumId}`,
  observation_id: `${observationId}`,
  observation_completedTime: completedTime,
  'plantDensity(raw)': `${plantDensity}`,
  'survivalRate(raw)': '80',
});

const latestChartData = () => chartRenders[chartRenders.length - 1];

const datasetLabelled = (label: string): ChartDataset | undefined =>
  latestChartData()?.datasets.find((dataset) => dataset.label === label);

describe('PlantingDensityPerStratumCard', () => {
  beforeEach(() => {
    chartRenders.length = 0;
  });

  it("charts each stratum's own latest plant density against its target", async () => {
    mockPlantingSite();
    mockPost(SEARCH_URL, {
      results: [
        searchRow(NORTH.id, 2, '2026-06-01T00:00:00Z', 1200),
        searchRow(NORTH.id, 1, '2026-01-01T00:00:00Z', 400),
        searchRow(SOUTH.id, 1, '2026-01-01T00:00:00Z', 900),
      ],
    });

    renderWithProviders(<PlantingDensityPerStratumCard plantingSiteId={PLANTING_SITE_ID} />);

    // South's density is missing if the card only reads the site's latest observation.
    await waitFor(() => expect(datasetLabelled(strings.PLANT_DENSITY)?.values).toEqual([1200, 900]));

    expect(latestChartData()?.labels).toEqual(['North', 'South']);
    expect(datasetLabelled(strings.TARGET_DENSITY)?.values).toEqual([
      [1500, 1500],
      [800, 800],
    ]);
  });

  it('still charts the target of a stratum that has never been observed', async () => {
    mockPlantingSite();
    mockPost(SEARCH_URL, { results: [searchRow(NORTH.id, 1, '2026-01-01T00:00:00Z', 1200)] });

    renderWithProviders(<PlantingDensityPerStratumCard plantingSiteId={PLANTING_SITE_ID} />);

    await waitFor(() => expect(datasetLabelled(strings.PLANT_DENSITY)?.values).toEqual([1200, null]));

    expect(latestChartData()?.labels).toEqual(['North', 'South']);
    expect(datasetLabelled(strings.TARGET_DENSITY)?.values).toEqual([
      [1500, 1500],
      [800, 800],
    ]);
  });

  it('charts targets alone when no stratum has been observed', async () => {
    mockPlantingSite();
    mockPost(SEARCH_URL, { results: [] });

    renderWithProviders(<PlantingDensityPerStratumCard plantingSiteId={PLANTING_SITE_ID} />);

    await waitFor(() => expect(latestChartData()?.labels).toEqual(['North', 'South']));

    expect(latestChartData()?.datasets.map((dataset) => dataset.label)).toEqual([strings.TARGET_DENSITY]);
  });
});
