import React from 'react';

import { rstest } from '@rstest/core';
import { waitFor } from '@testing-library/react';

import type { PieChartProps } from 'src/components/common/Chart/PieChart';
import NumberOfSpeciesPlantedCard from 'src/scenes/PlantsDashboardRouter/components/NumberOfSpeciesPlantedCard';
import PlantsReportedPerSpeciesCard from 'src/scenes/PlantsDashboardRouter/components/PlantsReportedPerSpeciesCard';
import {
  buildPlantingSite,
  buildSpecies,
  buildStratum,
  buildSubstratum,
  mockGet,
  renderWithProviders,
} from 'src/test-utils';

// jsdom cannot paint Chart.js, so assert on the data each card hands to PieChart.
const chartRenders = rstest.hoisted(() => [] as PieChartProps[]);

rstest.mock('src/components/common/Chart/PieChart', () => ({
  __esModule: true,
  default: (props: PieChartProps) => {
    chartRenders.push(props);
    return null;
  },
}));

const PLANTING_SITE_ID = 1;
const NORTH_ID = 10;
const SITE_URL = `/api/v1/tracking/sites/${PLANTING_SITE_ID}`;
const REPORTED_PLANTS_URL = `${SITE_URL}/reportedPlants`;

const chartFor = (chartId: string) => [...chartRenders].reverse().find((props) => props.chartId === chartId);

const mockEndpoints = () => {
  mockGet(SITE_URL, {
    site: buildPlantingSite({
      id: PLANTING_SITE_ID,
      strata: [
        buildStratum({ id: NORTH_ID, name: 'North', substrata: [buildSubstratum({ id: 100 })] }),
        buildStratum({ id: 20, name: 'South', substrata: [buildSubstratum({ id: 200 })] }),
      ],
    }),
  });
  mockGet(REPORTED_PLANTS_URL, {
    site: {
      id: PLANTING_SITE_ID,
      totalPlants: 999,
      species: [
        { id: 1, totalPlants: 500 },
        { id: 2, totalPlants: 300 },
        { id: 3, totalPlants: 199 },
      ],
      strata: [
        {
          id: NORTH_ID,
          progressPercent: 100,
          species: [
            { id: 1, totalPlants: 100 },
            { id: 2, totalPlants: 11 },
          ],
          substrata: [],
          totalPlants: 111,
          totalSpecies: 2,
        },
        {
          id: 20,
          progressPercent: 100,
          species: [{ id: 3, totalPlants: 888 }],
          substrata: [],
          totalPlants: 888,
          totalSpecies: 1,
        },
      ],
    },
  });
  mockGet('/api/v1/species', {
    species: [
      buildSpecies({ id: 1, scientificName: 'North species one', conservationCategory: 'LC', rare: true }),
      buildSpecies({ id: 2, scientificName: 'North species two', conservationCategory: 'EN', rare: false }),
      buildSpecies({ id: 3, scientificName: 'South species', conservationCategory: 'CR', rare: false }),
    ],
  });
};

describe('plant totals charts', () => {
  beforeEach(() => {
    chartRenders.length = 0;
  });

  it('uses only the selected stratum species in both charts', async () => {
    mockEndpoints();

    renderWithProviders(
      <>
        <PlantsReportedPerSpeciesCard newVersion plantingSiteId={PLANTING_SITE_ID} stratumId={NORTH_ID} />
        <NumberOfSpeciesPlantedCard plantingSiteId={PLANTING_SITE_ID} stratumId={NORTH_ID} />
      </>
    );

    await waitFor(() => {
      expect(chartFor('plantsBySpecies')?.chartData).toEqual({
        labels: ['North species one', 'North species two'],
        datasets: [{ values: [100, 11] }],
      });
      expect(chartFor('speciesByCategory')?.chartData?.datasets[0]?.values).toEqual([50, 50]);
    });

    expect(chartFor('speciesByCategory')?.chartData?.labels).toHaveLength(2);
    expect(chartFor('speciesByCategory')?.chartData?.labels).not.toContain('Critically Endangered (CR)');
  });
});
