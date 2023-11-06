import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';

export type Batch = components['schemas']['BatchResponsePayload']['batch'];
export type CreateBatchRequestPayload = components['schemas']['CreateBatchRequestPayload'];
export type NurseryWithdrawal = components['schemas']['GetNurseryWithdrawalResponsePayload']['withdrawal'];
export type BatchWithdrawal = NurseryWithdrawal['batchWithdrawals'][0];
export type NurseryWithdrawalPurpose = NurseryWithdrawal['purpose'];

export const NurseryWithdrawalPurposes: { [key: string]: NurseryWithdrawalPurpose } = {
  OUTPLANT: 'Out Plant',
  NURSERY_TRANSFER: 'Nursery Transfer',
  DEAD: 'Dead',
  OTHER: 'Other',
};

export const NurseryWithdrawalPurposesValues = Object.values(NurseryWithdrawalPurposes);

export type NurseryTransfer = components['schemas']['CreateNurseryTransferRequestPayload'];
export type NurseryWithdrawalRequest = components['schemas']['CreateNurseryWithdrawalRequestPayload'];

export const purposeLabel = (purpose: NurseryWithdrawalPurpose): string => {
  switch (purpose) {
    case 'Out Plant':
      return strings.OUTPLANT;
    case 'Nursery Transfer':
      return strings.NURSERY_TRANSFER;
    case 'Dead':
      return strings.DEAD;
    default:
      return strings.OTHER;
  }
};

export type BatchPhoto = components['schemas']['BatchPhotoPayload'];
