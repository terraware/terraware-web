import { MultiPolygon } from 'geojson';

import { MapBounds } from './types';
import { getBoundingBoxFromMultiPolygons, getBoundingBoxFromPoints, getBoundsZoomLevel, isBoundsValid } from './utils';

describe('isBoundsValid', () => {
  test.each([
    { minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 },
    { minLat: -10, maxLat: 10, minLng: 170, maxLng: -170 },
    { minLat: 5, maxLat: 5, minLng: 10, maxLng: 10 },
    { minLat: 86, maxLat: 89, minLng: 0, maxLng: 10 },
    { minLat: -10, maxLat: 10, minLng: 179, maxLng: 181 },
    { minLat: -10, maxLat: 10, minLng: 170, maxLng: 530 },
  ])('accepts geographic bounds including wrapped and degenerate bounds: %j', (bounds) => {
    expect(isBoundsValid(bounds)).toBe(true);
  });

  test.each([
    { minLat: -91 },
    { maxLat: 91 },
    { minLat: 11 },
    { minLng: -181 },
    { minLng: 181 },
    { maxLng: -181 },
    { maxLng: 341 },
    { maxLng: Infinity },
    { minLat: NaN },
    { maxLat: Infinity },
    { minLng: -Infinity },
    { maxLng: NaN },
  ])('rejects invalid coordinates: %j', (overrides) => {
    expect(isBoundsValid({ minLat: -10, maxLat: 10, minLng: -20, maxLng: 20, ...overrides })).toBe(false);
  });

  test('rejects the infinite bounds returned for empty points', () => {
    expect(isBoundsValid(getBoundingBoxFromPoints([]))).toBe(false);
  });
});

describe('getBoundsZoomLevel', () => {
  const bounds: MapBounds = { minLat: 0, maxLat: 10, minLng: 0, maxLng: 10 };

  test.each([
    [1024, 512, 6],
    [256, 1024, 5],
    [2048, 1024, 7],
  ])('fits both dimensions and floors the zoom for a %i by %i map', (width, height, expected) => {
    expect(getBoundsZoomLevel(bounds, width, height)).toBe(expected);
  });

  test('uses the short longitude span for bounds crossing the antimeridian', () => {
    expect(getBoundsZoomLevel({ minLat: -10, maxLat: 10, minLng: 170, maxLng: -170 }, 1024, 512)).toBe(5);
    expect(getBoundsZoomLevel({ minLat: -10, maxLat: 10, minLng: -170, maxLng: 170 }, 1024, 512)).toBe(2);
  });

  test('uses latitude for zero-width bounds', () => {
    expect(getBoundsZoomLevel({ ...bounds, minLng: 5, maxLng: 5 }, 1024, 512)).toBe(6);
  });

  test('uses longitude for zero-height bounds', () => {
    expect(getBoundsZoomLevel({ ...bounds, minLat: 5, maxLat: 5 }, 1024, 512)).toBe(7);
  });

  test('returns maximum zoom for single-point bounds', () => {
    expect(getBoundsZoomLevel(getBoundingBoxFromPoints([{ lat: 5, lng: 5 }]), 1024, 512)).toBe(22);
  });

  test('caps the zoom for very small nonzero bounds', () => {
    expect(getBoundsZoomLevel({ minLat: 0, maxLat: 1e-10, minLng: 0, maxLng: 1e-10 }, 400, 400)).toBe(22);
  });

  test('fits bounds near the Mercator limit without changing their latitudes', () => {
    expect(getBoundsZoomLevel({ minLat: -85, maxLat: 85, minLng: -180, maxLng: 180 }, 1024, 512)).toBe(1);
  });

  test.each([
    [-89, 89],
    [-89.999, 89.999],
    [-90, 90],
  ])('clamps polar latitudes to Mercator limits for [%f, %f]', (minLat, maxLat) => {
    const clampedZoom = getBoundsZoomLevel(
      { minLat: -85.0511287798, maxLat: 85.0511287798, minLng: -180, maxLng: 180 },
      400,
      400
    );
    expect(getBoundsZoomLevel({ minLat, maxLat, minLng: -180, maxLng: 180 }, 400, 400)).toBe(clampedZoom);
    expect(clampedZoom).toBe(0);
  });

  test.each([
    [-89, -85.1],
    [85.1, 89],
  ])('uses longitude when both latitudes clamp to the same limit: %j', (minLat, maxLat) => {
    expect(getBoundsZoomLevel({ minLat, maxLat, minLng: 0, maxLng: 10 }, 1024, 512)).toBe(7);
  });

  test.each([-90, 90])('returns finite zoom for zero-height bounds at latitude %f', (lat) => {
    expect(getBoundsZoomLevel({ minLat: lat, maxLat: lat, minLng: 0, maxLng: 10 }, 1024, 512)).toBe(7);
    expect(getBoundsZoomLevel({ minLat: lat, maxLat: lat, minLng: 0, maxLng: 0 }, 1024, 512)).toBe(22);
  });

  test('gives a crossing bounding box the same zoom as equivalent wrapped bounds', () => {
    const crossingBounds = getBoundingBoxFromPoints([
      { lat: -2, lng: 179 },
      { lat: 3, lng: -179 },
    ]);
    expect(getBoundsZoomLevel(crossingBounds, 400, 400)).toBe(
      getBoundsZoomLevel({ ...crossingBounds, maxLng: -179 }, 400, 400)
    );
  });

  test('returns zero for latitudes outside geographic limits', () => {
    expect(getBoundsZoomLevel({ minLat: -91, maxLat: 91, minLng: 0, maxLng: 10 }, 1024, 512)).toBe(0);
  });

  test('returns zero for empty-input bounds', () => {
    expect(getBoundsZoomLevel(getBoundingBoxFromPoints([]), 1024, 512)).toBe(0);
  });

  test.each([
    [0, 512],
    [1024, -1],
    [NaN, 512],
    [1024, Infinity],
  ])('returns zero for invalid map dimensions %j', (width, height) => {
    expect(getBoundsZoomLevel(bounds, width, height)).toBe(0);
  });
});

describe('getBoundingBoxFromPoints', () => {
  test('finds extrema independently of point order', () => {
    expect(
      getBoundingBoxFromPoints([
        { lat: 3, lng: -20 },
        { lat: -10, lng: 4 },
        { lat: 15, lng: 30 },
      ])
    ).toEqual({
      minLat: -10,
      maxLat: 15,
      minLng: -20,
      maxLng: 30,
    });
  });

  test('returns point bounds for a single point', () => {
    expect(getBoundingBoxFromPoints([{ lat: -5, lng: 20 }])).toEqual({
      minLat: -5,
      maxLat: -5,
      minLng: 20,
      maxLng: 20,
    });
  });

  test('returns infinite extrema for empty input', () => {
    expect(getBoundingBoxFromPoints([])).toEqual({
      minLat: Infinity,
      maxLat: -Infinity,
      minLng: Infinity,
      maxLng: -Infinity,
    });
  });

  test('unwraps the narrowest span across the antimeridian', () => {
    expect(
      getBoundingBoxFromPoints([
        { lat: -2, lng: 179 },
        { lat: 3, lng: -179 },
      ])
    ).toEqual({
      minLat: -2,
      maxLat: 3,
      minLng: 179,
      maxLng: 181,
    });
  });

  test('finds the largest gap regardless of input order and duplicate points', () => {
    expect(
      getBoundingBoxFromPoints([
        { lat: 0, lng: -175 },
        { lat: 1, lng: 160 },
        { lat: 2, lng: 170 },
        { lat: 1, lng: 160 },
      ])
    ).toEqual({ minLat: 0, maxLat: 2, minLng: 160, maxLng: 185 });
  });

  test('preserves non-crossing bounds when longitude gaps are tied', () => {
    expect(
      getBoundingBoxFromPoints([
        { lat: 0, lng: -90 },
        { lat: 1, lng: 90 },
      ])
    ).toEqual({
      minLat: 0,
      maxLat: 1,
      minLng: -90,
      maxLng: 90,
    });
  });

  test('treats opposite representations of the antimeridian as the same longitude', () => {
    expect(
      getBoundingBoxFromPoints([
        { lat: 0, lng: -180 },
        { lat: 1, lng: 180 },
      ])
    ).toEqual({
      minLat: 0,
      maxLat: 1,
      minLng: 180,
      maxLng: 180,
    });
  });

  test('ignores the entire point when either coordinate is non-finite', () => {
    expect(
      getBoundingBoxFromPoints([
        { lat: 5, lng: 10 },
        { lat: NaN, lng: -100 },
        { lat: -80, lng: Infinity },
        { lat: Infinity, lng: 90 },
        { lat: 80, lng: NaN },
      ])
    ).toEqual({ minLat: 5, maxLat: 5, minLng: 10, maxLng: 10 });
  });

  test('returns empty bounds when all points are non-finite', () => {
    expect(
      getBoundingBoxFromPoints([
        { lat: NaN, lng: 0 },
        { lat: 0, lng: -Infinity },
      ])
    ).toEqual(getBoundingBoxFromPoints([]));
  });
});

describe('getBoundingBoxFromMultiPolygons', () => {
  const multipolygon: MultiPolygon = {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
        [
          [2, 2],
          [2, 4],
          [4, 4],
          [4, 2],
          [2, 2],
        ],
      ],
      [
        [
          [20, -10],
          [30, -10],
          [30, -5],
          [20, -10],
        ],
      ],
    ],
  };

  test('includes multiple polygons and rings, with holes leaving outer bounds unchanged', () => {
    expect(getBoundingBoxFromMultiPolygons([multipolygon])).toEqual({
      minLat: -10,
      maxLat: 10,
      minLng: 0,
      maxLng: 30,
    });
  });

  test('combines all multipolygons', () => {
    expect(
      getBoundingBoxFromMultiPolygons([
        multipolygon,
        {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [-30, 20],
                [-20, 20],
                [-20, 40],
                [-30, 20],
              ],
            ],
          ],
        },
      ])
    ).toEqual({ minLat: -10, maxLat: 40, minLng: -30, maxLng: 30 });
  });

  test('unwraps antimeridian polygons to the narrowest span', () => {
    expect(
      getBoundingBoxFromMultiPolygons([
        {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [179, -2],
                [-179, -2],
                [-179, 3],
                [179, -2],
              ],
            ],
          ],
        },
      ])
    ).toEqual({ minLat: -2, maxLat: 3, minLng: 179, maxLng: 181 });
  });

  test.each<MultiPolygon[][]>([
    [[]],
    [[{ type: 'MultiPolygon', coordinates: [] }]],
    [[{ type: 'MultiPolygon', coordinates: [[]] }]],
    [[{ type: 'MultiPolygon', coordinates: [[[]]] }]],
  ])('returns infinite extrema for empty geometry: %j', (multipolygons) => {
    expect(getBoundingBoxFromMultiPolygons(multipolygons)).toEqual({
      minLat: Infinity,
      maxLat: -Infinity,
      minLng: Infinity,
      maxLng: -Infinity,
    });
  });
});
