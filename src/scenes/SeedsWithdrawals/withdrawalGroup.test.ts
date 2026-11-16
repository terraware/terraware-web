import { SeedWithdrawalCreation } from 'src/queries/accessions/events';

import { findWithdrawalGroupIds, isGroupedPurpose } from './withdrawalGroup';

const BASE_TIME = new Date('2026-01-15T10:00:00.000Z').getTime();

const creation = (
  withdrawalId: number,
  secondsAfterBase: number,
  createdByUserId = 1,
  accessionId = withdrawalId * 10
): SeedWithdrawalCreation => ({
  withdrawalId,
  accessionId,
  createdTime: BASE_TIME + secondsAfterBase * 1000,
  createdByUserId,
});

describe('isGroupedPurpose', () => {
  it('is false for viability tests', () => {
    expect(isGroupedPurpose('Viability Testing')).toBe(false);
  });

  it('is true for the purposes that can withdraw from several accessions at once', () => {
    expect(isGroupedPurpose('Nursery')).toBe(true);
    expect(isGroupedPurpose('Out-planting')).toBe(true);
    expect(isGroupedPurpose('Other')).toBe(true);
  });

  it('is true when the purpose is unknown', () => {
    expect(isGroupedPurpose(undefined)).toBe(true);
  });
});

describe('findWithdrawalGroupIds', () => {
  it('groups withdrawals the same user created seconds apart', () => {
    const creations = [creation(1, 0), creation(2, 2), creation(3, 5)];

    expect(findWithdrawalGroupIds(creations, 1)).toEqual([1, 2, 3]);
  });

  it('returns the same group whichever member is the anchor', () => {
    const creations = [creation(1, 0), creation(2, 2), creation(3, 5)];

    const groups = creations.map(({ withdrawalId }) => findWithdrawalGroupIds(creations, withdrawalId));

    expect(groups).toEqual([
      [1, 2, 3],
      [1, 2, 3],
      [1, 2, 3],
    ]);
  });

  it('orders the group by creation time regardless of the input order', () => {
    const creations = [creation(3, 5), creation(1, 0), creation(2, 2)];

    expect(findWithdrawalGroupIds(creations, 3)).toEqual([1, 2, 3]);
  });

  it('keeps withdrawals exactly at the gap threshold together', () => {
    const creations = [creation(1, 0), creation(2, 10), creation(3, 20)];

    expect(findWithdrawalGroupIds(creations, 1)).toEqual([1, 2, 3]);
  });

  it('splits the run at a gap longer than the threshold and returns the anchor side', () => {
    const creations = [creation(1, 0), creation(2, 3), creation(3, 30), creation(4, 33)];

    expect(findWithdrawalGroupIds(creations, 1)).toEqual([1, 2]);
    expect(findWithdrawalGroupIds(creations, 2)).toEqual([1, 2]);
    expect(findWithdrawalGroupIds(creations, 3)).toEqual([3, 4]);
    expect(findWithdrawalGroupIds(creations, 4)).toEqual([3, 4]);
  });

  it('excludes withdrawals another user created in the same window', () => {
    const creations = [creation(1, 0), creation(2, 1, 2), creation(3, 2), creation(4, 3, 2)];

    expect(findWithdrawalGroupIds(creations, 1)).toEqual([1, 3]);
    expect(findWithdrawalGroupIds(creations, 2)).toEqual([2, 4]);
  });

  it('returns a lone withdrawal on its own', () => {
    const creations = [creation(1, 0), creation(2, 60), creation(3, 120)];

    expect(findWithdrawalGroupIds(creations, 2)).toEqual([2]);
  });

  it('returns just the id when the creation is missing', () => {
    expect(findWithdrawalGroupIds([creation(1, 0), creation(2, 2)], 99)).toEqual([99]);
    expect(findWithdrawalGroupIds([], 7)).toEqual([7]);
  });

  it('breaks ties on identical timestamps by withdrawal id', () => {
    const creations = [creation(3, 0), creation(1, 0), creation(2, 0)];

    expect(findWithdrawalGroupIds(creations, 2)).toEqual([1, 2, 3]);
  });
});
