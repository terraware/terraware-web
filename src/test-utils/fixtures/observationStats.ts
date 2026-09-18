import {
  ObservationSiteStatsPayload,
  ObservationStratumStatsPayload,
  ObservationSubstratumStatsPayload,
} from 'src/queries/generated/observations';

/**
 * The stats endpoint returns every stratum and substratum of the site. Override `observationId`
 * and `completedTime` with `undefined` for one that was never observed.
 */
export const buildSubstratumStats = (
  overrides: Partial<ObservationSubstratumStatsPayload> = {}
): ObservationSubstratumStatsPayload => ({
  completedTime: '2026-01-01T00:00:00Z',
  observationId: 1,
  plantingDensity: 1200,
  substratumId: 1,
  survivalRate: 80,
  totalPlants: 100,
  totalSpecies: 4,
  ...overrides,
});

export const buildStratumStats = (
  overrides: Partial<ObservationStratumStatsPayload> = {}
): ObservationStratumStatsPayload => ({
  completedTime: '2026-01-01T00:00:00Z',
  observationId: 1,
  plantingDensity: 1200,
  stratumId: 1,
  substrata: [buildSubstratumStats()],
  survivalRate: 80,
  totalPlants: 100,
  totalSpecies: 4,
  ...overrides,
});

export const buildSiteObservationStats = (
  overrides: Partial<ObservationSiteStatsPayload> = {}
): ObservationSiteStatsPayload => ({
  completedTime: '2026-01-01T00:00:00Z',
  observationId: 1,
  plantingDensity: 1100,
  plantingSiteId: 1,
  strata: [buildStratumStats()],
  survivalRate: 75,
  totalPlants: 200,
  totalSpecies: 6,
  ...overrides,
});
