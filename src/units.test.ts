import { convertWeightToSeedCount } from './units';

describe('convertWeightToSeedCount', () => {
  it('returns 0 without a subset count', () => {
    expect(convertWeightToSeedCount(100, 'Grams', { quantity: 1, units: 'Grams' }, undefined)).toBe(0);
    expect(convertWeightToSeedCount(100, 'Grams', { quantity: 1, units: 'Grams' }, 0)).toBe(0);
  });

  it('returns 0 without a subset weight', () => {
    expect(convertWeightToSeedCount(100, 'Grams', undefined, 10)).toBe(0);
    expect(convertWeightToSeedCount(100, 'Grams', { quantity: 0, units: 'Grams' }, 10)).toBe(0);
  });

  it('applies the subset ratio when the units already match', () => {
    // 5g at 1g per 10 seeds is 50 seeds.
    expect(convertWeightToSeedCount(5, 'Grams', { quantity: 1, units: 'Grams' }, 10)).toBe(50);
  });

  it('converts to the subset weight units before applying the subset ratio', () => {
    // 5000mg is 5g, so still 50 seeds against a 1g per 10 seed subset.
    expect(convertWeightToSeedCount(5000, 'Milligrams', { quantity: 1, units: 'Grams' }, 10)).toBe(50);
    // 1kg is 1000g, at 100g per 25 seeds that is 250 seeds.
    expect(convertWeightToSeedCount(1, 'Kilograms', { quantity: 100, units: 'Grams' }, 25)).toBe(250);
  });

  it('converts milligrams to ounces without the grams factor', () => {
    // 1000mg against a 1oz per 10 seed subset is ~0.035oz, which rounds to no whole seeds.
    // The regressed factor would have made this ~35oz and produced hundreds of seeds.
    expect(convertWeightToSeedCount(1000, 'Milligrams', { quantity: 1, units: 'Ounces' }, 10)).toBe(0);
  });

  it('rounds to the nearest whole seed', () => {
    // 1g at 3g per 10 seeds is 3.33 seeds.
    expect(convertWeightToSeedCount(1, 'Grams', { quantity: 3, units: 'Grams' }, 10)).toBe(3);
    // 2g at 3g per 10 seeds is 6.67 seeds.
    expect(convertWeightToSeedCount(2, 'Grams', { quantity: 3, units: 'Grams' }, 10)).toBe(7);
  });
});
