import strings from 'src/strings';

import { AccessionWithdrawInfo } from './types';
import {
  estimatedSeedCount,
  remainingCountOf,
  remainingWeightOf,
  validateRow,
  withdrawAllValue,
} from './withdrawCalc';

// An accession whose remaining quantity is stored as a seed count.
const seedsAccession = (overrides: Partial<AccessionWithdrawInfo> = {}): AccessionWithdrawInfo => ({
  id: 1,
  accessionNumber: 'XYZ-001',
  scientificName: 'Acacia koa',
  facilityId: 101,
  remainingQuantity: { quantity: 100, units: 'Seeds' },
  estimatedCount: 100,
  estimatedWeight: { quantity: 50, units: 'Grams' },
  ...overrides,
});

// An accession whose remaining quantity is stored as a weight, with subset data so a seed
// count can be derived (5g == 100 seeds, so 10g remaining == 200 seeds).
const weightAccession = (overrides: Partial<AccessionWithdrawInfo> = {}): AccessionWithdrawInfo => ({
  id: 2,
  accessionNumber: 'XYZ-002',
  scientificName: 'Acacia koa',
  facilityId: 101,
  remainingQuantity: { quantity: 10, units: 'Grams' },
  estimatedCount: 200,
  estimatedWeight: { quantity: 10, units: 'Grams' },
  subsetWeight: { quantity: 5, units: 'Grams' },
  subsetCount: 100,
  ...overrides,
});

// Weight-stored accession missing the subset data needed to convert weight to a seed count.
const weightNoSubsetAccession = (overrides: Partial<AccessionWithdrawInfo> = {}): AccessionWithdrawInfo => ({
  id: 3,
  accessionNumber: 'XYZ-003',
  scientificName: 'Acacia koa',
  facilityId: 101,
  remainingQuantity: { quantity: 10, units: 'Grams' },
  estimatedWeight: { quantity: 10, units: 'Grams' },
  ...overrides,
});

describe('remainingWeightOf', () => {
  it('uses the estimated weight when the accession is stored in seeds', () => {
    expect(remainingWeightOf(seedsAccession())).toEqual({ quantity: 50, units: 'Grams' });
  });

  it('uses the remaining quantity directly when it is already a weight', () => {
    expect(remainingWeightOf(weightAccession())).toEqual({ quantity: 10, units: 'Grams' });
  });
});

describe('remainingCountOf', () => {
  it('returns the seed count directly when stored in seeds', () => {
    expect(remainingCountOf(seedsAccession())).toBe(100);
  });

  it('derives the seed count from the remaining weight and subset data', () => {
    expect(remainingCountOf(weightAccession())).toBe(200);
  });

  it('is undefined when subset data is missing', () => {
    expect(remainingCountOf(weightNoSubsetAccession())).toBeUndefined();
  });
});

describe('estimatedSeedCount', () => {
  it('is zero when no value is entered', () => {
    expect(estimatedSeedCount(weightAccession(), true, undefined, 'Grams')).toBe(0);
    expect(estimatedSeedCount(seedsAccession(), false, undefined, 'Seeds')).toBe(0);
  });

  it('returns the value unchanged in count mode', () => {
    expect(estimatedSeedCount(seedsAccession(), false, 42, 'Seeds')).toBe(42);
  });

  it('converts weight to a seed count using the subset ratio', () => {
    // 5g -> 100 seeds, so 7g -> 140 seeds.
    expect(estimatedSeedCount(weightAccession(), true, 7, 'Grams')).toBe(140);
  });

  it('is zero in weight mode when subset data is missing', () => {
    expect(estimatedSeedCount(weightNoSubsetAccession(), true, 5, 'Grams')).toBe(0);
  });
});

describe('withdrawAllValue', () => {
  it('withdraws all remaining seeds in count mode when stored in seeds', () => {
    expect(withdrawAllValue(seedsAccession(), false)).toEqual({ value: 100, units: 'Seeds' });
  });

  it('withdraws the estimated count in count mode when stored in weight', () => {
    expect(withdrawAllValue(weightAccession(), false)).toEqual({ value: 200, units: 'Seeds' });
  });

  it('is undefined in count mode when stored in weight without an estimated count', () => {
    expect(withdrawAllValue(weightNoSubsetAccession(), false)).toBeUndefined();
  });

  it('withdraws all remaining weight in weight mode', () => {
    expect(withdrawAllValue(weightAccession(), true)).toEqual({ value: 10, units: 'Grams' });
    // Even without subset data the weight itself is known.
    expect(withdrawAllValue(weightNoSubsetAccession(), true)).toEqual({ value: 10, units: 'Grams' });
  });

  it('is undefined in weight mode when only a seed count is known', () => {
    expect(withdrawAllValue(seedsAccession({ estimatedWeight: undefined }), true)).toBeUndefined();
  });
});

describe('validateRow (count mode)', () => {
  it('accepts a count within the remaining seeds', () => {
    expect(validateRow(seedsAccession(), 'Other', false, 50, 'Seeds')).toBe('');
  });

  it('rejects a count above the remaining seeds', () => {
    expect(validateRow(seedsAccession(), 'Other', false, 150, 'Seeds')).toBe(strings.WITHDRAWN_QUANTITY_ERROR);
  });

  it('requires a value', () => {
    expect(validateRow(seedsAccession(), 'Other', false, undefined, 'Seeds')).toBe(strings.REQUIRED_FIELD);
  });

  it('rejects a negative value as invalid', () => {
    expect(validateRow(seedsAccession(), 'Other', false, -5, 'Seeds')).toBe(strings.INVALID_VALUE);
  });

  it('checks against the estimated count when stored in weight', () => {
    expect(validateRow(weightAccession(), 'Other', false, 150, 'Seeds')).toBe('');
    expect(validateRow(weightAccession(), 'Other', false, 250, 'Seeds')).toBe(strings.WITHDRAWN_QUANTITY_ERROR);
  });

  it('requires subset data to withdraw by count when stored in weight', () => {
    expect(validateRow(weightNoSubsetAccession(), 'Other', false, 10, 'Seeds')).toBe(
      strings.MISSING_SUBSET_WEIGHT_ERROR_COUNT
    );
  });
});

describe('validateRow (weight mode)', () => {
  it('accepts a weight within the remaining amount', () => {
    expect(validateRow(weightAccession(), 'Nursery', true, 5, 'Grams')).toBe('');
  });

  it('rejects a weight whose seed count exceeds the remaining count', () => {
    expect(validateRow(weightAccession(), 'Nursery', true, 20, 'Grams')).toBe(strings.WITHDRAWN_QUANTITY_ERROR);
  });

  it('requires subset data for a nursery withdrawal', () => {
    expect(validateRow(weightNoSubsetAccession(), 'Nursery', true, 5, 'Grams')).toBe(
      strings.MISSING_SUBSET_WEIGHT_ERROR_NURSERY
    );
  });

  it('requires subset data for a viability test with its own message', () => {
    expect(validateRow(weightNoSubsetAccession(), 'Viability Testing', true, 5, 'Grams')).toBe(
      strings.MISSING_SUBSET_WEIGHT_ERROR_VIABILITY_TEST
    );
  });

  it('requires a value', () => {
    expect(validateRow(weightAccession(), 'Other', true, undefined, 'Grams')).toBe(strings.REQUIRED_FIELD);
  });

  it('rejects a negative value as invalid', () => {
    expect(validateRow(weightAccession(), 'Other', true, -1, 'Grams')).toBe(strings.INVALID_VALUE);
  });

  it('rejects a nursery amount that rounds to zero seeds', () => {
    expect(validateRow(weightAccession(), 'Nursery', true, 0.01, 'Grams')).toBe(
      strings.WITHDRAWAL_COUNT_GREATER_THAN_ZERO_ERROR
    );
  });

  it('rejects a weight over the remaining amount for a non-count purpose without subset data', () => {
    // Other does not require subset data, so the seed-count check is skipped and only the
    // weight bound applies: 15g > 10g remaining.
    expect(validateRow(weightNoSubsetAccession(), 'Other', true, 15, 'Grams')).toBe(strings.WITHDRAWN_QUANTITY_ERROR);
    expect(validateRow(weightNoSubsetAccession(), 'Other', true, 8, 'Grams')).toBe('');
  });
});
