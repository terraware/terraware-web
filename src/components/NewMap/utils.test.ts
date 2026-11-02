import { MapBounds } from './types';
import { getBoundingBoxFromPoints, getBoundsZoomLevel, isBoundsValid } from './utils';

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
