import React from 'react';

import { screen } from '@testing-library/react';

import HighestAndLowestSurvivalRateStrataCard from 'src/scenes/PlantsDashboardRouter/components/HighestAndLowestSurvivalRateStrataCard';
import strings from 'src/strings';
import {
  buildPlantingSite,
  buildSiteObservationStats,
  buildStratum,
  buildStratumStats,
  mockGet,
  renderWithProviders,
} from 'src/test-utils';

const PLANTING_SITE_ID = 1;
const SITE_URL = `/api/v1/tracking/sites/${PLANTING_SITE_ID}`;
const STATS_URL = '/api/v1/tracking/observations/results/stats';

const NORTH = buildStratum({ id: 10, name: 'North' });
const SOUTH = buildStratum({ id: 20, name: 'South' });

const mockSite = (strata = [NORTH, SOUTH]) => {
  mockGet(SITE_URL, { site: buildPlantingSite({ id: PLANTING_SITE_ID, strata }) });
};

const mockStats = (strata: ReturnType<typeof buildStratumStats>[]) => {
  mockGet(STATS_URL, { stats: [buildSiteObservationStats({ plantingSiteId: PLANTING_SITE_ID, strata })] });
};

describe('HighestAndLowestSurvivalRateStrataCard', () => {
  it('ranks strata using the observation each one was last observed in', async () => {
    mockSite();
    // South was last observed in an older observation than North. Ranking off the site's latest
    // observation alone would drop it.
    mockStats([
      buildStratumStats({
        stratumId: NORTH.id,
        observationId: 2,
        completedTime: '2026-06-01T00:00:00Z',
        survivalRate: 90,
      }),
      buildStratumStats({
        stratumId: SOUTH.id,
        observationId: 1,
        completedTime: '2026-01-01T00:00:00Z',
        survivalRate: 70,
      }),
    ]);

    renderWithProviders(<HighestAndLowestSurvivalRateStrataCard plantingSiteId={PLANTING_SITE_ID} />);

    expect(await screen.findByText('North')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('South')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText(strings.HIGHEST)).toBeInTheDocument();
    expect(screen.getByText(strings.LOWEST)).toBeInTheDocument();
    expect(screen.queryByText(strings.SINGLE_STRATUM_SURVIVAL_RATE_MESSAGE)).not.toBeInTheDocument();
  });

  it('leaves out a stratum that has never been observed', async () => {
    mockSite();
    mockStats([
      buildStratumStats({ stratumId: NORTH.id, survivalRate: 90 }),
      buildStratumStats({
        stratumId: SOUTH.id,
        observationId: undefined,
        completedTime: undefined,
        survivalRate: undefined,
      }),
    ]);

    renderWithProviders(<HighestAndLowestSurvivalRateStrataCard plantingSiteId={PLANTING_SITE_ID} />);

    expect(await screen.findByText('North')).toBeInTheDocument();
    expect(screen.queryByText('South')).not.toBeInTheDocument();
    expect(screen.queryByText(strings.LOWEST)).not.toBeInTheDocument();
    expect(screen.getByText(strings.SINGLE_STRATUM_SURVIVAL_RATE_MESSAGE)).toBeInTheDocument();
  });

  it('explains that neither rate can be calculated when no stratum reports one', async () => {
    mockSite();
    mockStats([
      buildStratumStats({ stratumId: NORTH.id, survivalRate: undefined }),
      buildStratumStats({ stratumId: SOUTH.id, survivalRate: undefined }),
    ]);

    renderWithProviders(<HighestAndLowestSurvivalRateStrataCard plantingSiteId={PLANTING_SITE_ID} />);

    expect(await screen.findAllByText(strings.CANNOT_BE_CALCULATED)).toHaveLength(2);
    expect(screen.queryByText('North')).not.toBeInTheDocument();
  });

  it('ignores stats for strata the site payload does not know about', async () => {
    mockSite([NORTH]);
    mockStats([
      buildStratumStats({ stratumId: NORTH.id, survivalRate: 90 }),
      buildStratumStats({ stratumId: 999, survivalRate: 10 }),
    ]);

    renderWithProviders(<HighestAndLowestSurvivalRateStrataCard plantingSiteId={PLANTING_SITE_ID} />);

    expect(await screen.findByText('North')).toBeInTheDocument();
    expect(screen.queryByText('10%')).not.toBeInTheDocument();
  });
});
