import React from 'react';

import { screen } from '@testing-library/react';

import PlantingSiteDensityCard from 'src/scenes/PlantsDashboardRouter/components/PlantingSiteDensityCard';
import strings from 'src/strings';
import { buildPlantingSite, buildStratum, buildSubstratum, mockGet, renderWithProviders } from 'src/test-utils';

const PLANTING_SITE_ID = 1;
const OBSERVATION_ID = 7;
const SITE_URL = `/api/v1/tracking/sites/${PLANTING_SITE_ID}`;
const RESULTS_URL = `/api/v1/tracking/observations/${OBSERVATION_ID}/results`;

const mockObservationResults = () => {
  mockGet(RESULTS_URL, {
    observation: {
      observationId: OBSERVATION_ID,
      plantingSiteId: PLANTING_SITE_ID,
      plantingDensity: 1234,
    },
  });
};

const mockPlantingSite = (secondSubstratumObservationId: number | undefined) => {
  mockGet(SITE_URL, {
    site: buildPlantingSite({
      id: PLANTING_SITE_ID,
      latestObservationId: OBSERVATION_ID,
      strata: [
        buildStratum({
          id: 10,
          substrata: [
            buildSubstratum({ id: 100, latestObservationId: OBSERVATION_ID }),
            buildSubstratum({ id: 200, latestObservationId: secondSubstratumObservationId }),
          ],
        }),
      ],
    }),
  });
};

describe('PlantingSiteDensityCard', () => {
  it('warns that the density is a sample when a substratum has never been observed', async () => {
    mockPlantingSite(undefined);
    mockObservationResults();

    renderWithProviders(<PlantingSiteDensityCard plantingSiteId={PLANTING_SITE_ID} />);

    expect(await screen.findByText(strings.SAMPLE_OBSERVED_DENSITY_WARNING)).toBeInTheDocument();
  });

  it('reports the density without a warning once every substratum has been observed', async () => {
    // Observed by an earlier observation than the site's latest: coverage, not recency, is the test.
    mockPlantingSite(OBSERVATION_ID - 1);
    mockObservationResults();

    renderWithProviders(<PlantingSiteDensityCard plantingSiteId={PLANTING_SITE_ID} />);

    expect(await screen.findByText('1,234')).toBeInTheDocument();
    expect(screen.queryByText(strings.SAMPLE_OBSERVED_DENSITY_WARNING)).not.toBeInTheDocument();
  });
});
