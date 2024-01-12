import { Geometry } from 'geojson';
import { GeometryFeature } from 'src/types/Map';
import { cutPolygons, leftMostFeature } from './utils';

const feature1: GeometryFeature = {
  type: 'Feature',
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [5, 5],
          [10, 5],
          [10, 10],
          [5, 10],
          [5, 5],
        ],
      ],
    ],
  },
  properties: { hello: 'world' },
  id: 0,
};

const feature2: GeometryFeature = {
  type: 'Feature',
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [10, 5],
          [15, 5],
          [15, 10],
          [10, 10],
          [10, 5],
        ],
      ],
    ],
  },
  properties: { yoyo: 'ma' },
  id: 1,
};

const feature3: GeometryFeature = {
  type: 'Feature',
  geometry: {
    type: 'MultiPolygon',
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
  },
  properties: { lorem: 'ipsum' },
  id: 2,
};

const cutOnNoOverlap: Geometry = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [100, 5],
        [150, 5],
        [150, 10],
        [100, 10],
        [100, 5],
      ],
    ],
  ],
};

const cutWithOverlap: Geometry = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [7.5, 0],
        [12.5, 0],
        [12.5, 100],
        [7.5, 100],
        [7.5, 0],
      ],
    ],
  ],
};

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
