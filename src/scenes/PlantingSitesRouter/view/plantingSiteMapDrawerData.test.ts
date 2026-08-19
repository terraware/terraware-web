import { MapLayerFeatureId } from 'src/components/NewMap/types';
import { PlantingSitePayload, PlantingSiteSpeciesTargetPayload } from 'src/queries/generated/plantingSites';

import { getPlantingSiteMapDrawerData } from './plantingSiteMapDrawerData';

const boundary = { type: 'MultiPolygon', coordinates: [] } as any;

const makeSite = (): PlantingSitePayload =>
  ({
    id: 1,
    name: 'Site A',
    areaHa: 12.5,
    organizationId: 1,
    boundary,
    strata: [
      {
        id: 10,
        name: 'Stratum 1',
        areaHa: 8,
        initialPlantingDensity: 1500,
        targetPlantDensity: 2000,
        boundary,
        substrata: [
          { id: 100, name: 'Sub 1', areaHa: 5, plantingCompleted: true, boundary },
          { id: 101, name: 'Sub 2', areaHa: 3, plantingCompleted: false, boundary },
        ],
      },
      {
        id: 20,
        name: 'Stratum 2',
        areaHa: 4,
        initialPlantingDensity: 900,
        boundary,
        substrata: [{ id: 200, name: 'Sub 3', areaHa: 4, plantingCompleted: true, boundary }],
      },
    ],
  }) as unknown as PlantingSitePayload;

const speciesTargets: PlantingSiteSpeciesTargetPayload[] = [
  { speciesId: 5, stratumIds: [10], targetPlants: 500 },
  { speciesId: 6, stratumIds: [10, 20] },
  { speciesId: 7, stratumIds: [20] },
];

const featureId = (layerId: string, id: string): MapLayerFeatureId => ({ layerId, featureId: id });

describe('getPlantingSiteMapDrawerData', () => {
  test('returns undefined when the planting site is undefined', () => {
    expect(getPlantingSiteMapDrawerData(undefined, featureId('sites', '1'))).toBeUndefined();
  });

  test('returns site data with planting complete plus strata and substrata counts', () => {
    expect(getPlantingSiteMapDrawerData(makeSite(), featureId('sites', '1'))).toEqual({
      type: 'site',
      name: 'Site A',
      areaHa: 12.5,
      plantingComplete: false,
      strataCount: 2,
      substrataCount: 3,
    });
  });

  test('site planting complete is true when every substratum across all strata is complete', () => {
    const site = makeSite();
    site.strata?.forEach((stratum) => stratum.substrata.forEach((substratum) => (substratum.plantingCompleted = true)));

    const result = getPlantingSiteMapDrawerData(site, featureId('sites', '1'));
    expect(result?.type === 'site' && result.plantingComplete).toBe(true);
  });

  test('returns stratum data; planting complete is false when any substratum is incomplete', () => {
    expect(getPlantingSiteMapDrawerData(makeSite(), featureId('strata', '10'), speciesTargets)).toEqual({
      type: 'stratum',
      name: 'Stratum 1',
      areaHa: 8,
      plantingComplete: false,
      initialPlantingDensity: 1500,
      targetPlantDensity: 2000,
      speciesIds: [5, 6],
    });
  });

  test('stratum planting complete is true when all substrata are complete', () => {
    expect(getPlantingSiteMapDrawerData(makeSite(), featureId('strata', '20'), speciesTargets)).toEqual({
      type: 'stratum',
      name: 'Stratum 2',
      areaHa: 4,
      plantingComplete: true,
      initialPlantingDensity: 900,
      targetPlantDensity: undefined,
      speciesIds: [6, 7],
    });
  });

  test('stratum species are empty when no species targets are provided', () => {
    const result = getPlantingSiteMapDrawerData(makeSite(), featureId('strata', '10'));
    expect(result?.type === 'stratum' && result.speciesIds).toEqual([]);
  });

  test('stratum species are empty when no target covers the stratum', () => {
    const result = getPlantingSiteMapDrawerData(makeSite(), featureId('strata', '10'), [
      { speciesId: 7, stratumIds: [20] },
    ]);
    expect(result?.type === 'stratum' && result.speciesIds).toEqual([]);
  });

  test('returns substratum data with densities and stratum name inherited from the parent stratum', () => {
    expect(getPlantingSiteMapDrawerData(makeSite(), featureId('substrata', '101'))).toEqual({
      type: 'substratum',
      name: 'Sub 2',
      stratumName: 'Stratum 1',
      areaHa: 3,
      plantingComplete: false,
      initialPlantingDensity: 1500,
      targetPlantDensity: 2000,
    });
  });

  test('substratum target density is undefined when the parent stratum has none', () => {
    const result = getPlantingSiteMapDrawerData(makeSite(), featureId('substrata', '200'));
    expect(result?.type === 'substratum' && result.targetPlantDensity).toBeUndefined();
  });

  test('returns undefined for an unknown feature id', () => {
    expect(getPlantingSiteMapDrawerData(makeSite(), featureId('strata', '999'))).toBeUndefined();
  });
});
