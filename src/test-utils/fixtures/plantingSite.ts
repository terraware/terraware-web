import {
  MultiPolygon,
  PlantingSitePayload,
  StratumResponsePayload,
  SubstratumResponsePayload,
} from 'src/queries/generated/plantingSites';

/** Geometry is never rendered in jsdom, so any shape that type checks will do. */
const boundary: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    ],
  ],
};

export const buildSubstratum = (overrides: Partial<SubstratumResponsePayload> = {}): SubstratumResponsePayload => ({
  areaHa: 5,
  boundary,
  fullName: 'Stratum A-1',
  id: 1,
  latestObservationId: 1,
  latestObservationCompletedTime: '2026-01-01T00:00:00Z',
  monitoringPlots: [],
  name: '1',
  plantingCompleted: true,
  ...overrides,
});

export const buildStratum = (overrides: Partial<StratumResponsePayload> = {}): StratumResponsePayload => ({
  areaHa: 10,
  boundary,
  boundaryModifiedTime: '2026-01-01T00:00:00Z',
  id: 1,
  initialPlantingDensity: 1000,
  name: 'Stratum A',
  numPermanentPlots: 2,
  numTemporaryPlots: 1,
  substrata: [buildSubstratum()],
  targetPlantDensity: 1500,
  ...overrides,
});

export const buildPlantingSite = (overrides: Partial<PlantingSitePayload> = {}): PlantingSitePayload => ({
  adHocPlots: [],
  areaHa: 10,
  boundary,
  id: 1,
  name: 'Test Planting Site',
  organizationId: 1,
  strata: [buildStratum()],
  ...overrides,
});
