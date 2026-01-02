import { readData } from './utils';
import MapService from '../MapService';

describe('Map service', () => {
  describe('Geometry utilities', () => {
    it('should calculate the bounding box from a list of polygons', () => {
      const data = readData('polygons.json');
      const observedBbox = MapService.getBoundingBox(data);
      const expectedBbox = {
        lowerLeft: [-4, -4],
        upperRight: [4, 4],
      };

      expect(observedBbox).toEqual(expectedBbox);
    });

    it('should calcualte the bounding box from planting sites data', () => {
      const data = readData('plantingSite.json');
      const mapData = MapService.getMapDataFromPlantingSite(data);
      const observedBbox = MapService.getPlantingSiteBoundingBox(mapData);
      const expectedBbox = {
        lowerLeft: [-138.12211603, 26.89432882],
        upperRight: [-138.10623684, 26.90304444],
      };

      expect(observedBbox).toEqual(expectedBbox);
    });

    it('should extract geometries from a map entity construct', () => {
      const boundary = [
        [
          [
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
            [1, 1],
          ],
        ],
      ];
      const data = {
        id: 1,
        properties: { id: 1, name: 'test', type: 'stratum' },
        boundary,
      };
      const expected = [
        [
          [
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
            [1, 1],
          ],
        ],
      ];

      expect(MapService.getMapEntityGeometry(data)).toEqual(expected);
    });

    it('should extract site info from planting site hierarchy', () => {
      const data = readData('plantingSite.json');
      const observed = MapService.extractPlantingSite(data);

      expect(observed).toEqual(readData('extractedSite.json'));
    });

    it('should extract strata info from planting site hierarchy', () => {
      const data = readData('plantingSite.json');
      const observed = MapService.extractStrata(data);

      expect(observed).toEqual(readData('extractedStrata.json'));
    });

    it('should extract substrata info from planting site hierarchy', () => {
      const data = readData('plantingSite.json');
      const observed = MapService.extractSubstrata(data);

      expect(observed).toEqual(readData('extractedSubstrata.json'));
    });
  });
});
