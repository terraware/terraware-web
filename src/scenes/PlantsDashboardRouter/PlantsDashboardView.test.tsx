import React, { type ReactNode } from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';

import PlantsDashboardView from 'src/scenes/PlantsDashboardRouter/PlantsDashboardView';
import { renderWithProviders } from 'src/test-utils';

type PlantsAndSpeciesCardProps = {
  stratumId?: number;
};

const selectedPlantingSite = rstest.hoisted(() => ({ value: 1 as number | 'all' }));
const siteStrata = rstest.hoisted(() => ({
  value: [
    { id: 10, name: 'North', substrata: [{ id: 100 }] },
    { id: 20, name: 'South', substrata: [{ id: 200 }] },
  ],
}));
const plantsAndSpeciesCardProps = rstest.hoisted(() => [] as PlantsAndSpeciesCardProps[]);

rstest.mock('@terraware/web-components', () => ({
  findLocaleDetails: <T,>(locales: T[]) => locales[0],
  Dropdown: ({
    id,
    onChange,
    options,
    selectedValue,
  }: {
    id: string;
    onChange: (value: string) => void;
    options: { label: string; value: number | string }[];
    selectedValue: number | string;
  }) => (
    <select aria-label={id} value={selectedValue} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

rstest.mock('@terraware/web-components/utils', () => ({
  useDeviceInfo: () => ({ isDesktop: true, isMobile: false }),
}));

rstest.mock('src/hooks/useStickyPlantingSiteId', () => ({
  __esModule: true,
  ALL_PLANTING_SITES: 'all',
  default: () => ({ selectedPlantingSiteId: selectedPlantingSite.value, selectPlantingSite: () => undefined }),
}));

rstest.mock('src/hooks/usePlantingSite', () => ({
  __esModule: true,
  default: () => ({
    plantingSite:
      selectedPlantingSite.value === 'all'
        ? undefined
        : {
            id: 1,
            areaHa: 10,
            boundary: { coordinates: [] },
            latestObservationId: undefined,
            strata: siteStrata.value,
          },
  }),
}));

rstest.mock('src/hooks/useAcceleratorConsole', () => ({
  __esModule: true,
  default: () => ({ isAcceleratorRoute: false }),
}));

rstest.mock('src/hooks/useSurvivalRateCalculationInProgress', () => ({
  __esModule: true,
  default: () => ({ inProgress: false }),
}));

rstest.mock('src/hooks/useSyncNavigate', () => ({ useSyncNavigate: () => () => undefined }));
rstest.mock('src/scenes/PlantsDashboardRouter/useDashboardPlantingSites', () => ({
  __esModule: true,
  default: () => ({ showAllSitesOption: false }),
}));

rstest.mock('src/scenes/PlantsDashboardRouter/components/PlantsDashboardHeader', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

rstest.mock('src/scenes/PlantsDashboardRouter/components/PlantsAndSpeciesCard', () => ({
  __esModule: true,
  default: (props: PlantsAndSpeciesCardProps) => {
    plantsAndSpeciesCardProps.push(props);
    return null;
  },
}));

rstest.mock('src/components/SurvivalRate/SurvivalRateRecalculationMessage', () => ({
  __esModule: true,
  default: () => null,
}));
rstest.mock('src/scenes/PlantsDashboardRouter/components/EmptyPlantingSiteMap', () => ({
  __esModule: true,
  default: () => null,
}));
rstest.mock('src/scenes/PlantsDashboardRouter/components/LatestObservationLink', () => ({
  __esModule: true,
  default: () => null,
}));
rstest.mock('src/scenes/PlantsDashboardRouter/components/MultiplePlantingSiteMap', () => ({
  __esModule: true,
  default: () => null,
}));
rstest.mock('src/scenes/PlantsDashboardRouter/components/PlantDashboardMap', () => ({
  __esModule: true,
  default: () => null,
}));
rstest.mock('src/scenes/PlantsDashboardRouter/components/PlantingDensityCard', () => ({
  __esModule: true,
  default: () => null,
}));
rstest.mock('src/scenes/PlantsDashboardRouter/components/PlantingSiteTrendsCard', () => ({
  __esModule: true,
  default: () => null,
}));
rstest.mock('src/scenes/PlantsDashboardRouter/components/SimplePlantingSiteMap', () => ({
  __esModule: true,
  default: () => null,
}));
rstest.mock('src/scenes/PlantsDashboardRouter/components/SurvivalRateCard', () => ({
  __esModule: true,
  default: () => null,
}));

describe('PlantsDashboardView planting site totals stratum filter', () => {
  beforeEach(() => {
    selectedPlantingSite.value = 1;
    siteStrata.value = [
      { id: 10, name: 'North', substrata: [{ id: 100 }] },
      { id: 20, name: 'South', substrata: [{ id: 200 }] },
    ];
    plantsAndSpeciesCardProps.length = 0;
  });

  it('defaults to All Strata for a site with multiple strata and passes a selected stratum to the totals card', async () => {
    const { user } = renderWithProviders(<PlantsDashboardView />);

    const dropdown = screen.getByRole('combobox', { name: 'planting-site-totals-stratum' });
    expect(screen.getByText('Planted Totals')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'All Strata' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'North' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'South' })).toBeInTheDocument();
    expect(plantsAndSpeciesCardProps.at(-1)).toMatchObject({ stratumId: undefined });

    await user.selectOptions(dropdown, '10');

    await waitFor(() => expect(plantsAndSpeciesCardProps.at(-1)).toMatchObject({ stratumId: 10 }));
  });

  it('defaults to the only stratum and omits All Strata for a site with one stratum', async () => {
    siteStrata.value = [{ id: 10, name: 'North', substrata: [{ id: 100 }] }];

    renderWithProviders(<PlantsDashboardView />);

    const dropdown = screen.getByRole('combobox', { name: 'planting-site-totals-stratum' });
    expect(screen.queryByRole('option', { name: 'All Strata' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'North' })).toBeInTheDocument();
    expect(dropdown).toHaveValue('10');
    await waitFor(() => expect(plantsAndSpeciesCardProps.at(-1)).toMatchObject({ stratumId: 10 }));
  });

  it('does not show the stratum filter when all planting sites are selected', () => {
    selectedPlantingSite.value = 'all';

    renderWithProviders(<PlantsDashboardView />);

    expect(screen.queryByRole('combobox', { name: 'planting-site-totals-stratum' })).not.toBeInTheDocument();
  });
});
