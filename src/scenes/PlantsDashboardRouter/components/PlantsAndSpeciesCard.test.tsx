import React from 'react';

import { rstest } from '@rstest/core';
import { screen } from '@testing-library/react';

import type { ProgressChartProps } from 'src/components/common/Chart/ProgressChart';
import PlantsAndSpeciesCard from 'src/scenes/PlantsDashboardRouter/components/PlantsAndSpeciesCard';
import { buildPlantingSite, buildStratum, buildSubstratum, mockGet, renderWithProviders } from 'src/test-utils';

type ChartCardProps = {
  stratumId?: number;
};

const progressChartProps = rstest.hoisted(() => [] as ProgressChartProps[]);
const plantsReportedCardProps = rstest.hoisted(() => [] as ChartCardProps[]);
const speciesCardProps = rstest.hoisted(() => [] as ChartCardProps[]);

rstest.mock('src/components/common/Chart/ProgressChart', () => ({
  __esModule: true,
  default: (props: ProgressChartProps) => {
    progressChartProps.push(props);
    return null;
  },
}));

rstest.mock('src/scenes/PlantsDashboardRouter/components/PlantsReportedPerSpeciesCard', () => ({
  __esModule: true,
  default: (props: ChartCardProps) => {
    plantsReportedCardProps.push(props);
    return null;
  },
}));

rstest.mock('src/scenes/PlantsDashboardRouter/components/NumberOfSpeciesPlantedCard', () => ({
  __esModule: true,
  default: (props: ChartCardProps) => {
    speciesCardProps.push(props);
    return null;
  },
}));

const PLANTING_SITE_ID = 1;
const NORTH_ID = 10;
const SITE_URL = `/api/v1/tracking/sites/${PLANTING_SITE_ID}`;
const REPORTED_PLANTS_URL = `${SITE_URL}/reportedPlants`;

const north = buildStratum({
  id: NORTH_ID,
  name: 'North',
  areaHa: 10,
  substrata: [
    buildSubstratum({ id: 100, areaHa: 6, plantingCompleted: true }),
    buildSubstratum({ id: 101, areaHa: 4, plantingCompleted: false }),
  ],
});

const south = buildStratum({
  id: 20,
  name: 'South',
  areaHa: 20,
  substrata: [buildSubstratum({ id: 200, areaHa: 20, plantingCompleted: true })],
});

const mockEndpoints = () => {
  mockGet(SITE_URL, {
    site: buildPlantingSite({ id: PLANTING_SITE_ID, areaHa: 30, strata: [north, south] }),
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
          progressPercent: 60,
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
};

describe('PlantsAndSpeciesCard', () => {
  beforeEach(() => {
    progressChartProps.length = 0;
    plantsReportedCardProps.length = 0;
    speciesCardProps.length = 0;
  });

  it('shows totals for the selected stratum and scopes both charts to it', async () => {
    mockEndpoints();

    renderWithProviders(<PlantsAndSpeciesCard plantingSiteId={PLANTING_SITE_ID} stratumId={NORTH_ID} />);

    expect(await screen.findByText('6 ha')).toBeInTheDocument();
    expect(screen.getByText('111 Plants')).toBeInTheDocument();
    expect(screen.getByText('2 Species')).toBeInTheDocument();
    expect(screen.getByText(/Planting Complete: 60%/)).toBeInTheDocument();
    expect(progressChartProps.at(-1)).toMatchObject({ value: 6, target: 10 });
    expect(plantsReportedCardProps.at(-1)).toMatchObject({
      plantingSiteId: PLANTING_SITE_ID,
      stratumId: NORTH_ID,
    });
    expect(speciesCardProps.at(-1)).toMatchObject({
      plantingSiteId: PLANTING_SITE_ID,
      stratumId: NORTH_ID,
    });
  });

  it('keeps whole-site totals and charts when no stratum is selected', async () => {
    mockEndpoints();

    renderWithProviders(<PlantsAndSpeciesCard plantingSiteId={PLANTING_SITE_ID} />);

    expect(await screen.findByText('26 ha')).toBeInTheDocument();
    expect(screen.getByText('999 Plants')).toBeInTheDocument();
    expect(screen.getByText('3 Species')).toBeInTheDocument();
    expect(progressChartProps.at(-1)).toMatchObject({ value: 26, target: 30 });
    expect(plantsReportedCardProps.at(-1)).toMatchObject({ stratumId: undefined });
    expect(speciesCardProps.at(-1)).toMatchObject({ stratumId: undefined });
  });
});
