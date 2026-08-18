import { CreateNurseryTransferRequestPayload } from 'src/queries/generated/accessionsV2';
import {
  BatchPayload,
  BatchPhotoPayload,
  BatchHistoryPayload as GeneratedBatchHistoryPayload,
  CreateBatchRequestPayload as GeneratedCreateBatchRequestPayload,
} from 'src/queries/generated/nurseryBatches';
import {
  CreateNurseryWithdrawalRequestPayload,
  BatchWithdrawalPayload as GeneratedBatchWithdrawalPayload,
  NurseryWithdrawalPayload,
} from 'src/queries/generated/nurseryWithdrawals';
import strings from 'src/strings';

export type Batch = BatchPayload;
export type BatchHistoryItem = GeneratedBatchHistoryPayload;
export type CreateBatchRequestPayload = GeneratedCreateBatchRequestPayload;
export type NurseryWithdrawalPurpose = NurseryWithdrawalPayload['purpose'];
export type BatchHistoryPayload = GeneratedBatchHistoryPayload;

export const NurseryWithdrawalPurposes: { [key: string]: NurseryWithdrawalPurpose } = {
  OUTPLANT: 'Out Plant',
  NURSERY_TRANSFER: 'Nursery Transfer',
  DEAD: 'Dead',
  UNDO: 'Undo',
  OTHER: 'Other',
};

export const NurseryWithdrawalPurposesValues = Object.values(NurseryWithdrawalPurposes);

export type NurseryTransfer = CreateNurseryTransferRequestPayload;
export type NurseryWithdrawalRequest = CreateNurseryWithdrawalRequestPayload;
export type NurseryWithdrawalRequestPurpose = NurseryWithdrawalRequest['purpose'];
export type BatchWithdrawalPayload = GeneratedBatchWithdrawalPayload;

export const NurseryWithdrawalRequestPurposes: { [key: string]: NurseryWithdrawalRequestPurpose } = {
  OUTPLANT: 'Out Plant',
  NURSERY_TRANSFER: 'Nursery Transfer',
  DEAD: 'Dead',
  OTHER: 'Other',
};

export const purposeLabel = (purpose: NurseryWithdrawalPurpose): string => {
  switch (purpose) {
    case 'Out Plant':
      return strings.PLANTING;
    case 'Nursery Transfer':
      return strings.NURSERY_TRANSFER;
    case 'Dead':
      return strings.DEAD;
    case 'Undo':
      return strings.UNDO_WITHDRAWAL;
    default:
      return strings.OTHER;
  }
};

export type BatchPhoto = BatchPhotoPayload;

export const getBatchHistoryTypesEnum = (): BatchHistoryPayload['type'][] => [
  'DetailsEdited',
  'IncomingWithdrawal',
  'OutgoingWithdrawal',
  'PhotoCreated',
  'PhotoDeleted',
  'QuantityEdited',
  'StatusChanged',
];

export const batchHistoryEventEnumToLocalized = (batchHistoryType: BatchHistoryPayload['type']): string | undefined => {
  switch (batchHistoryType) {
    case 'DetailsEdited': {
      return strings.BATCH_HISTORY_TYPE_DETAILS_EDITED;
    }
    case 'IncomingWithdrawal': {
      return strings.BATCH_HISTORY_TYPE_INCOMING_WITHDRAWAL;
    }
    case 'OutgoingWithdrawal': {
      return strings.BATCH_HISTORY_TYPE_OUTGOING_WITHDRAWAL;
    }
    case 'PhotoCreated': {
      return strings.BATCH_HISTORY_TYPE_PHOTO_CREATED;
    }
    case 'PhotoDeleted': {
      return strings.BATCH_HISTORY_TYPE_PHOTO_DELETED;
    }
    case 'QuantityEdited': {
      return strings.BATCH_HISTORY_TYPE_QUANTITY_EDITED;
    }
    case 'StatusChanged': {
      return strings.BATCH_HISTORY_TYPE_STATUS_CHANGED;
    }
  }
};

export type ModalValuesType = {
  type: string;
  openChangeQuantityModal: boolean;
  batch?: any;
};
