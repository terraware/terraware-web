import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';
import { isArrayOfT, isNumber, isObject, isOptionalNumber, isString } from './utils';

export type Batch = components['schemas']['BatchResponsePayload']['batch'];
export const isBatch = (input: unknown): input is Batch =>
  isObject(input) &&
  isOptionalNumber(input.accessionId) &&
  isString(input.addedDate) &&
  isString(input.batchNumber) &&
  isNumber(input.facilityId) &&
  isNumber(input.germinatingQuantity) &&
  isOptionalNumber(input.germinationRate) &&
  isNumber(input.id) &&
  isOptionalNumber(input.facilityId) &&
  isString(input.notes) &&
  isNumber(input.notReadyQuantity) &&
  isString(input.readyByDate) &&
  isNumber(input.readyQuantity) &&
  isNumber(input.speciesId) &&
  isArrayOfT<number>(input.subLocationIds, isNumber) &&
  isNumber(input.version);

export type BatchHistoryItem = components['schemas']['BatchHistoryPayload'];
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
