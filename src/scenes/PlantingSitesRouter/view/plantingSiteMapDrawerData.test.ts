import { MapLayerFeatureId } from 'src/components/NewMap/types';
import { PlantingSite } from 'src/types/Tracking';

import { getPlantingSiteMapDrawerData } from './plantingSiteMapDrawerData';

const boundary = { type: 'MultiPolygon', coordinates: [] } as any;

const makeSite = (): PlantingSite =>
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
        targetPlantingDensity: 1500,
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
        targetPlantingDensity: 900,
        boundary,
        substrata: [{ id: 200, name: 'Sub 3', areaHa: 4, plantingCompleted: true, boundary }],
      },
    ],
  }) as unknown as PlantingSite;

const featureId = (layerId: string, id: string): MapLayerFeatureId => ({ layerId, featureId: id });

describe('getPlantingSiteMapDrawerData', () => {
  test('returns undefined when the planting site is undefined', () => {
    expect(getPlantingSiteMapDrawerData(undefined, featureId('sites', '1'))).toBeUndefined();
  });

  test('returns site data with strata and substrata counts', () => {
    expect(getPlantingSiteMapDrawerData(makeSite(), featureId('sites', '1'))).toEqual({
      type: 'site',
      name: 'Site A',
      areaHa: 12.5,
      strataCount: 2,
      substrataCount: 3,
    });
  });

  test('returns stratum data; planting complete is false when any substratum is incomplete', () => {
    expect(getPlantingSiteMapDrawerData(makeSite(), featureId('strata', '10'))).toEqual({
      type: 'stratum',
      name: 'Stratum 1',
      areaHa: 8,
      plantingComplete: false,
      targetPlantingDensity: 1500,
    });
  });

  test('stratum planting complete is true when all substrata are complete', () => {
    expect(getPlantingSiteMapDrawerData(makeSite(), featureId('strata', '20'))).toEqual({
      type: 'stratum',
      name: 'Stratum 2',
      areaHa: 4,
      plantingComplete: true,
      targetPlantingDensity: 900,
    });
  });

  test('returns substratum data with target density inherited from the parent stratum', () => {
    expect(getPlantingSiteMapDrawerData(makeSite(), featureId('substrata', '101'))).toEqual({
      type: 'substratum',
      name: 'Sub 2',
      areaHa: 3,
      plantingComplete: false,
      targetPlantingDensity: 1500,
    });
  });

  test('returns undefined for an unknown feature id', () => {
    expect(getPlantingSiteMapDrawerData(makeSite(), featureId('strata', '999'))).toBeUndefined();
  });
});
