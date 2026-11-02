import { getBoundingBoxFromPoints, isBoundsValid } from './utils';

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
