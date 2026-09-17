import React from 'react';

import { screen } from '@testing-library/react';

import HighestAndLowestSurvivalRateStrataCard from 'src/scenes/PlantsDashboardRouter/components/HighestAndLowestSurvivalRateStrataCard';
import strings from 'src/strings';
import {
  buildPlantingSite,
  buildStratum,
  buildSubstratum,
  mockGet,
  mockPost,
  renderWithProviders,
} from 'src/test-utils';

const PLANTING_SITE_ID = 1;
const SITE_URL = `/api/v1/tracking/sites/${PLANTING_SITE_ID}`;
const SEARCH_URL = '/api/v1/search';

const NORTH = buildStratum({ id: 10, name: 'North', substrata: [buildSubstratum({ id: 100 })] });
const SOUTH = buildStratum({ id: 20, name: 'South', substrata: [buildSubstratum({ id: 200 })] });

const mockPlantingSite = (strata = [NORTH, SOUTH]) => {
  mockGet(SITE_URL, { site: buildPlantingSite({ id: PLANTING_SITE_ID, strata }) });
};

const searchRow = (stratumId: number, observationId: number, completedTime: string, survivalRate?: number) => ({
  stratum_id: `${stratumId}`,
  observation_id: `${observationId}`,
  observation_completedTime: completedTime,
  ...(survivalRate === undefined ? {} : { 'survivalRate(raw)': `${survivalRate}` }),
});

describe('HighestAndLowestSurvivalRateStrataCard', () => {
  it('ranks each stratum by its own latest observation, not the site-wide latest one', async () => {
    mockPlantingSite();
    mockPost(SEARCH_URL, {
      results: [
        searchRow(NORTH.id, 2, '2026-06-01T00:00:00Z', 90),
        searchRow(NORTH.id, 1, '2026-01-01T00:00:00Z', 40),
        searchRow(SOUTH.id, 1, '2026-01-01T00:00:00Z', 70),
      ],
    });

    renderWithProviders(<HighestAndLowestSurvivalRateStrataCard plantingSiteId={PLANTING_SITE_ID} />);

    expect(await screen.findByText('North')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();

    // South drops out entirely if the card only reads the site's latest observation.
    expect(screen.getByText('South')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText(strings.HIGHEST)).toBeInTheDocument();
    expect(screen.getByText(strings.LOWEST)).toBeInTheDocument();
    expect(screen.queryByText(strings.SINGLE_STRATUM_SURVIVAL_RATE_MESSAGE)).not.toBeInTheDocument();
  });

  it('leaves out a stratum that has never been observed', async () => {
    mockPlantingSite();
    mockPost(SEARCH_URL, { results: [searchRow(NORTH.id, 1, '2026-01-01T00:00:00Z', 90)] });

    renderWithProviders(<HighestAndLowestSurvivalRateStrataCard plantingSiteId={PLANTING_SITE_ID} />);

    expect(await screen.findByText('North')).toBeInTheDocument();
    expect(screen.queryByText('South')).not.toBeInTheDocument();
    expect(screen.queryByText(strings.LOWEST)).not.toBeInTheDocument();
    expect(screen.getByText(strings.SINGLE_STRATUM_SURVIVAL_RATE_MESSAGE)).toBeInTheDocument();
  });

  it('explains that neither rate can be calculated when no stratum reports a survival rate', async () => {
    mockPlantingSite();
    mockPost(SEARCH_URL, {
      results: [searchRow(NORTH.id, 1, '2026-01-01T00:00:00Z'), searchRow(SOUTH.id, 1, '2026-01-01T00:00:00Z')],
    });

    renderWithProviders(<HighestAndLowestSurvivalRateStrataCard plantingSiteId={PLANTING_SITE_ID} />);

    expect(await screen.findAllByText(strings.CANNOT_BE_CALCULATED)).toHaveLength(2);
    expect(screen.getByText(strings.HIGHEST)).toBeInTheDocument();
    expect(screen.getByText(strings.LOWEST)).toBeInTheDocument();
    expect(screen.queryByText('North')).not.toBeInTheDocument();
  });
});
