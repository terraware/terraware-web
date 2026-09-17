import React from 'react';

import { screen } from '@testing-library/react';

import PlantingSiteDensityCard from 'src/scenes/PlantsDashboardRouter/components/PlantingSiteDensityCard';
import strings from 'src/strings';
import {
  buildSiteObservationStats,
  buildStratumStats,
  buildSubstratumStats,
  mockGet,
  renderWithProviders,
} from 'src/test-utils';

const PLANTING_SITE_ID = 1;
const STATS_URL = '/api/v1/tracking/observations/results/stats';

const mockStats = (strata: ReturnType<typeof buildStratumStats>[], plantingDensity = 1014) => {
  mockGet(STATS_URL, {
    stats: buildSiteObservationStats({ plantingSiteId: PLANTING_SITE_ID, plantingDensity, strata }),
  });
};

describe('PlantingSiteDensityCard', () => {
  it('shows the site density without a warning when every substratum has been observed', async () => {
    // The second substratum was observed by an older observation, which still counts as covered.
    mockStats([
      buildStratumStats({
        stratumId: 10,
        substrata: [
          buildSubstratumStats({ substratumId: 100, observationId: 2, completedTime: '2026-06-01T00:00:00Z' }),
          buildSubstratumStats({ substratumId: 200, observationId: 1, completedTime: '2026-01-01T00:00:00Z' }),
        ],
      }),
    ]);

    renderWithProviders(<PlantingSiteDensityCard plantingSiteId={PLANTING_SITE_ID} />);

    expect(await screen.findByText('1,014')).toBeInTheDocument();
    expect(screen.queryByText(strings.SAMPLE_OBSERVED_DENSITY_WARNING)).not.toBeInTheDocument();
  });

  it('warns when a substratum has never been observed', async () => {
    mockStats([
      buildStratumStats({
        stratumId: 10,
        substrata: [
          buildSubstratumStats({ substratumId: 100 }),
          buildSubstratumStats({ substratumId: 200, observationId: undefined, completedTime: undefined }),
        ],
      }),
    ]);

    renderWithProviders(<PlantingSiteDensityCard plantingSiteId={PLANTING_SITE_ID} />);

    expect(await screen.findByText(strings.SAMPLE_OBSERVED_DENSITY_WARNING)).toBeInTheDocument();
  });
});
