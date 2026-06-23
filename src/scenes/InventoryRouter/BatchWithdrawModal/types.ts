import { NurseryWithdrawalPurpose } from 'src/types/Batch';

export type BatchInfo = {
  batchId: number;
  batchNumber: string;
  speciesId: number;
  scientificName: string;
  commonName?: string;
  facilityId: number;
  facilityName: string;
  germinatingQuantity: number;
  activeGrowthQuantity: number;
  hardeningOffQuantity: number;
  readyQuantity: number;
  totalQuantity: number;
};

export type BatchWithdrawDraft = {
  purpose: NurseryWithdrawalPurpose;
  fromFacilityId?: number;
  destinationFacilityId?: number;
  plantingSiteId?: number;
  plantingSeasonId?: number;
  stratumId?: number;
  substratumId?: number;
  withdrawnDate: string;
  notes: string;
  // Withdraw quantities per batch (keyed by batchId). Phase-specific keys lets
  // the user split a single batch across germinating/active growth/etc.
  withdrawByBatch: Record<number, BatchWithdrawQuantities>;
  photos: File[];
};

export type BatchWithdrawQuantities = {
  readyQuantityWithdrawn: number;
  hardeningOffQuantityWithdrawn: number;
  activeGrowthQuantityWithdrawn: number;
  germinatingQuantityWithdrawn: number;
};
