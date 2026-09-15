import { SeedQuantityPayload } from 'src/queries/generated/accessionsV2';
import { UnitType } from 'src/units';

// Server-side withdrawal purpose values (see src/utils/withdrawalPurposes.tsx).
export type WithdrawPurpose = 'Nursery' | 'Out-planting' | 'Viability Testing' | 'Other';

export type AccessionWithdrawInfo = {
  id: number;
  accessionNumber: string;
  speciesId?: number;
  scientificName: string;
  commonName?: string;
  facilityId: number;
  receivedDate?: string;
  remainingQuantity?: SeedQuantityPayload;
  estimatedCount?: number;
  estimatedWeight?: SeedQuantityPayload;
  subsetWeight?: SeedQuantityPayload;
  subsetCount?: number;
};

export type WithdrawQuantity = {
  value?: number;
  units: UnitType;
};

export type WithdrawDraft = {
  purpose: WithdrawPurpose;
  destinationFacilityId?: number;
  batchId?: number;
  readyByDate?: string;
  testType?: string;
  substrate?: string;
  treatment?: string;
  withdrawnByUserId?: number;
  date: string;
  notes: string;
  withdrawByWeight: boolean;
  withdrawByAccession: Record<number, WithdrawQuantity>;
  photos: File[];
};

export const PHOTOS_ENABLED_PURPOSES: WithdrawPurpose[] = ['Nursery'];
