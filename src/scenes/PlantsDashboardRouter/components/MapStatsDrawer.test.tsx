import React from 'react';

import { screen } from '@testing-library/react';

import MapStatsDrawer from 'src/scenes/PlantsDashboardRouter/components/MapStatsDrawer';
import strings from 'src/strings';
import {
  buildPlantingSite,
  buildSiteObservationStats,
  buildStratum,
  buildStratumStats,
  buildSubstratum,
  buildSubstratumStats,
  mockGet,
  renderWithProviders,
} from 'src/test-utils';

const PLANTING_SITE_ID = 1;
const SITE_URL = `/api/v1/tracking/sites/${PLANTING_SITE_ID}`;
const REPORTED_PLANTS_URL = `/api/v1/tracking/sites/${PLANTING_SITE_ID}/reportedPlants`;
const STATS_URL = '/api/v1/tracking/observations/results/stats';

const NORTH = buildStratum({ id: 10, name: 'North', substrata: [buildSubstratum({ id: 100, name: 'North-1' })] });

const mockEndpoints = (strata: ReturnType<typeof buildStratumStats>[], siteOverrides = {}) => {
  mockGet(SITE_URL, { site: buildPlantingSite({ id: PLANTING_SITE_ID, strata: [NORTH] }) });
  mockGet(REPORTED_PLANTS_URL, { site: { id: PLANTING_SITE_ID, totalPlants: 500, species: [], strata: [] } });
  mockGet(STATS_URL, {
    stats: [buildSiteObservationStats({ plantingSiteId: PLANTING_SITE_ID, strata, ...siteOverrides })],
  });
};

describe('MapStatsDrawer', () => {
  it('links the date the site was observed to that observation', async () => {
    mockEndpoints([buildStratumStats({ stratumId: NORTH.id })], {
      observationId: 7,
      completedTime: '2026-09-17T00:00:00Z',
    });

    renderWithProviders(
      <MapStatsDrawer
        layerFeatureId={{ layerId: 'sites', featureId: `${PLANTING_SITE_ID}` }}
        plantingSiteId={PLANTING_SITE_ID}
      />
    );

    expect(await screen.findByText(strings.OBSERVED_ON)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'Sep 17, 2026' });
    expect(link).toHaveAttribute('href', '/observations/7');
  });

  it('uses the observation the stratum was last observed in, not the site one', async () => {
    mockEndpoints(
      [
        buildStratumStats({
          stratumId: NORTH.id,
          observationId: 3,
          completedTime: '2026-01-15T00:00:00Z',
          substrata: [buildSubstratumStats({ substratumId: 100 })],
        }),
      ],
      { observationId: 7, completedTime: '2026-09-17T00:00:00Z' }
    );

    renderWithProviders(
      <MapStatsDrawer
        layerFeatureId={{ layerId: 'strata', featureId: `${NORTH.id}` }}
        plantingSiteId={PLANTING_SITE_ID}
      />
    );

    expect(await screen.findByText(strings.OBSERVED_ON)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Jan 15, 2026' })).toHaveAttribute('href', '/observations/3');
  });

  it('omits the row for a stratum that has never been observed', async () => {
    mockEndpoints([
      buildStratumStats({
        stratumId: NORTH.id,
        observationId: undefined,
        completedTime: undefined,
        survivalRate: undefined,
        substrata: [buildSubstratumStats({ substratumId: 100, observationId: undefined })],
      }),
    ]);

    renderWithProviders(
      <MapStatsDrawer
        layerFeatureId={{ layerId: 'strata', featureId: `${NORTH.id}` }}
        plantingSiteId={PLANTING_SITE_ID}
      />
    );

    expect(await screen.findByText(strings.TYPE)).toBeInTheDocument();
    expect(screen.queryByText(strings.OBSERVED_ON)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.SURVIVAL_RATE)).not.toBeInTheDocument();
  });
});
