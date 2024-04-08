import { Geometry } from 'geojson';
import { GeometryFeature } from 'src/types/Map';
import { cutPolygons, leftMostFeature } from './utils';
import { feature1, feature2, feature3, cutOnNoOverlap, cutWithOverlap } from './testdata';

describe('Map utils', () => {
  describe('leftMostFeature', () => {
    test("should return null when there isn't a left most feature", () => {
      expect(leftMostFeature([])).toBeNull();
    });

    test("should return a left most feature with it's center point", () => {
      const leftMost = leftMostFeature([feature1, feature2]);

      expect(leftMost?.feature?.id).toBe(0);
      expect(leftMost?.center?.[0]).toBe(7.5);
      expect(leftMost?.center?.[1]).toBe(7.5);
    });
  });

  describe('cutPolygons', () => {
    test('should return null when the cut-on geometry is not a polygon', () => {
      expect(cutPolygons([feature1, feature2], { type: 'Point', coordinates: [1, 2] })).toBeNull();
    });

    test('should return null when the cut-on geometry does not overlap with the input', () => {
      expect(cutPolygons([feature1, feature2], cutOnNoOverlap)).toBeNull();
    });

    test('should return cut polygons when there is an overlap with cutting geometry', () => {
      const expected = [
        {
          type: 'Feature',
          geometry: {
            coordinates: [
              [
                [
                  [5, 5],
                  [7.5, 5],
                  [7.5, 10],
                  [5, 10],
                  [5, 5],
                ],
              ],
            ],
            type: 'MultiPolygon',
          },
          id: 0,
          properties: { hello: 'world' },
        },
        {
          type: 'Feature',
          geometry: {
            coordinates: [
              [
                [7.5, 5],
                [10, 5],
                [10, 10],
                [7.5, 10],
                [7.5, 5],
              ],
            ],
            type: 'Polygon',
          },
          properties: {},
        },
        {
          type: 'Feature',
          geometry: {
            coordinates: [
              [
                [
                  [12.5, 5],
                  [15, 5],
                  [15, 10],
                  [12.5, 10],
                  [12.5, 5],
                ],
              ],
            ],
            type: 'MultiPolygon',
          },
          id: 1,
          properties: { yoyo: 'ma' },
        },
        {
          type: 'Feature',
          geometry: {
            coordinates: [
              [
                [10, 5],
                [12.5, 5],
                [12.5, 10],
                [10, 10],
                [10, 5],
              ],
            ],
            type: 'Polygon',
          },
          properties: {},
        },
        {
          type: 'Feature',
          geometry: {
            coordinates: [
              [
                [
                  [15, 5],
                  [20, 5],
                  [20, 10],
                  [15, 10],
                  [15, 5],
                ],
              ],
            ],
            type: 'MultiPolygon',
          },
          id: 2,
          properties: { lorem: 'ipsum' },
        },
      ];

      expect(cutPolygons([feature1, feature2, feature3], cutWithOverlap)).toStrictEqual(expected);
    });
  });
});
