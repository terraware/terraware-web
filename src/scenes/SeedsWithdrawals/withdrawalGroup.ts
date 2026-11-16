import { SeedWithdrawalCreation } from 'src/queries/accessions/events';
import { SeedWithdrawalPurpose } from 'src/types/Accession';

const MAX_GAP_MS = 10_000;

export const isGroupedPurpose = (purpose?: SeedWithdrawalPurpose): boolean => purpose !== 'Viability Testing';

export const findWithdrawalGroupIds = (creations: SeedWithdrawalCreation[], withdrawalId: number): number[] => {
  const anchor = creations.find((creation) => creation.withdrawalId === withdrawalId);
  if (!anchor) {
    return [withdrawalId];
  }

  const sameUser = creations
    .filter((creation) => creation.createdByUserId === anchor.createdByUserId)
    .sort((a, b) => a.createdTime - b.createdTime || a.withdrawalId - b.withdrawalId);

  const anchorIndex = sameUser.findIndex((creation) => creation.withdrawalId === anchor.withdrawalId);

  let first = anchorIndex;
  while (first > 0 && sameUser[first].createdTime - sameUser[first - 1].createdTime <= MAX_GAP_MS) {
    first -= 1;
  }

  let last = anchorIndex;
  while (last < sameUser.length - 1 && sameUser[last + 1].createdTime - sameUser[last].createdTime <= MAX_GAP_MS) {
    last += 1;
  }

  return sameUser.slice(first, last + 1).map((creation) => creation.withdrawalId);
};
