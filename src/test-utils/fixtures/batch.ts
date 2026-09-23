import { Batch } from 'src/types/Batch';

/**
 * A nursery batch with the mandatory quantity and date fields filled in, and a `facilityId` that
 * matches the nursery in `buildOrganization`, so `BatchDetailsModal` renders without tripping its
 * required-field validation or its facility lookup.
 */
export const buildBatch = (overrides: Partial<Batch> = {}): Batch => ({
  id: 1,
  accessions: [],
  activeGrowthQuantity: 10,
  addedDate: '2024-01-01',
  batchNumber: '24-1-1-001',
  facilityId: 100,
  germinatingQuantity: 5,
  hardeningOffQuantity: 3,
  latestObservedTime: '2024-01-01T00:00:00Z',
  notReadyQuantity: 0,
  readyQuantity: 7,
  speciesId: 1,
  subLocationIds: [],
  totalWithdrawn: 0,
  version: 1,
  ...overrides,
});
