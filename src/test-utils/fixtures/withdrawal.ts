import { SearchNurseryWithdrawalPayload } from 'src/queries/search/nurseries';

/**
 * A row as it appears in the nursery withdrawals table — the shape the withdrawal modals and
 * detail views receive, rather than the raw API payload.
 */
export const buildWithdrawalRow = (
  overrides: Partial<SearchNurseryWithdrawalPayload> = {}
): SearchNurseryWithdrawalPayload => ({
  withdrawalId: 500,
  withdrawnDate: '2026-03-14',
  purpose: 'Out Plant',
  nurseryName: 'Test Nursery',
  destinationName: 'Test Planting Site',
  totalWithdrawn: 250,
  speciesNames: ['Acacia koa'],
  hasReassignments: false,
  ...overrides,
});
