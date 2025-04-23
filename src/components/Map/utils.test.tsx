import { Feature } from 'geojson';

import { ReadOnlyBoundary, RenderableReadOnlyBoundary } from 'src/types/Map';

import { cutOnNoOverlap, cutWithOverlap, feature1, feature2, feature3 } from './testdata';
import { boundariesToViewState, leftMostFeature, overlayAndSubtract, readOnlyBoundariesToMapLayers } from './utils';

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

  describe('overlayAndSubtract', () => {
    test('should return null when the overlay geometry is not a polygon', () => {
      expect(overlayAndSubtract([feature1, feature2], { type: 'Point', coordinates: [1, 2] })).toBeNull();
    });

    test('should return null when the overlay geometry does not overlap with the input', () => {
      expect(overlayAndSubtract([feature1, feature2], cutOnNoOverlap)).toBeNull();
    });

    test('should return existing polygons without the intersection, and the new polygon consisting of + the intersection, when there is an overlap with cutting geometry', () => {
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
        {
          type: 'Feature',
          geometry: {
            coordinates: [
              [
                [
                  [7.5, 5],
                  [12.5, 5],
                  [12.5, 10],
                  [7.5, 10],
                  [7.5, 5],
                ],
              ],
            ],
            type: 'MultiPolygon',
          },
          properties: {},
        },
      ];

      expect(overlayAndSubtract([feature1, feature2, feature3], cutWithOverlap)).toStrictEqual(expected);
    });
  });

  describe('boundariesToViewState', () => {
    test('should view the earth when there are no boundaries', () => {
      expect(boundariesToViewState([])).toEqual({
        bounds: [Infinity, Infinity, -Infinity, -Infinity],
        fitBoundsOptions: {
          animate: false,
          padding: 25,
        },
      });
    });

    test('has the correct bounds', () => {
      const boundaries: ReadOnlyBoundary[] = [
        {
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'MultiPolygon',
                  coordinates: [
                    [
                      [
                        [32.81043714, 2.24535757],
                        [33.02329606, 2.64270388],
                        [33.22495188, 2.5084025],
                        [33.05130381, 2.29573331],
                        [32.81043714, 2.24535757],
                      ],
                    ],
                  ],
                },
                properties: { id: 'applicationBoundary' },
                id: 'applicationBoundary',
              },
            ],
          },
          id: 'applicationBoundary',
        },
      ];
      expect(boundariesToViewState(boundaries)).toEqual({
        bounds: [32.81043714, 2.24535757, 33.22495188, 2.64270388],
        fitBoundsOptions: {
          animate: false,
          padding: 25,
        },
      });
    });
  });

  describe('readOnlyBoundariesToMapLayers', () => {
    test("should return null when there aren't any boundaries", () => {
      expect(readOnlyBoundariesToMapLayers([])).toBeNull();
      expect(readOnlyBoundariesToMapLayers(undefined)).toBeNull();
    });

    test('generates map layers from boundaries', () => {
      const boundary: Feature = {
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [32.81043714, 2.24535757],
                [33.02329606, 2.64270388],
                [33.22495188, 2.5084025],
                [33.05130381, 2.29573331],
                [32.81043714, 2.24535757],
              ],
            ],
          ],
        },
        id: 'countryBoundary',
        properties: { id: 'countryBoundary' },
        type: 'Feature',
      };
      const boundaries: RenderableReadOnlyBoundary[] = [
        {
          id: '1',
          data: {
            type: 'FeatureCollection',
            features: [boundary],
          },
          renderProperties: {
            isInteractive: false,
            fillColor: 'highlight',
            lineColor: 'blue',
            lineWidth: 1,
          },
        },
      ];

      expect(JSON.stringify(readOnlyBoundariesToMapLayers(boundaries))).toMatchSnapshot();
    });
  });
});
