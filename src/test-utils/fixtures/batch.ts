import { NurseryBatchesSearchResponseElement } from 'src/queries/search/batches';
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

type BatchSearchRowQuantities = {
  germinatingQuantity?: number;
  activeGrowthQuantity?: number;
  hardeningOffQuantity?: number;
  readyQuantity?: number;
};

/**
 * A batch as the search API returns it (`POST /api/v1/search` with prefix `batches`, e.g.
 * `listBatchesByIds`): string-valued fields alongside `(raw)` numeric quantities. `facility_id`
 * matches the nursery in `buildOrganization`.
 *
 * Pass quantities as numbers in the second argument; both the display and `(raw)` fields are
 * filled in from them, and `totalQuantity` is derived the way the server does (everything but
 * germinating).
 */
export const buildBatchSearchRow = (
  overrides: Partial<NurseryBatchesSearchResponseElement> = {},
  quantities: BatchSearchRowQuantities = {}
): NurseryBatchesSearchResponseElement => {
  const {
    germinatingQuantity = 0,
    activeGrowthQuantity = 0,
    hardeningOffQuantity = 0,
    readyQuantity = 100,
  } = quantities;
  const totalQuantity = activeGrowthQuantity + hardeningOffQuantity + readyQuantity;

  return {
    id: '1',
    addedDate: '2024-01-01',
    batchNumber: '24-1-1-001',
    facility_id: '100',
    facility_name: 'Test Nursery',
    germinationStartedDate: '',
    notes: '',
    readyByDate: '',
    seedsSownDate: '',
    species_id: '1',
    species_scientificName: 'Acacia koa',
    species_commonName: '',
    version: '1',
    germinatingQuantity: String(germinatingQuantity),
    'germinatingQuantity(raw)': germinatingQuantity,
    activeGrowthQuantity: String(activeGrowthQuantity),
    'activeGrowthQuantity(raw)': activeGrowthQuantity,
    hardeningOffQuantity: String(hardeningOffQuantity),
    'hardeningOffQuantity(raw)': hardeningOffQuantity,
    readyQuantity: String(readyQuantity),
    'readyQuantity(raw)': readyQuantity,
    totalQuantity: String(totalQuantity),
    'totalQuantity(raw)': totalQuantity,
    ...overrides,
  };
};
