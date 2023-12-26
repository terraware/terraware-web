import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';

export type Batch = components['schemas']['BatchResponsePayload']['batch'];
export type BatchHistoryItem = components['schemas']['BatchHistoryPayload'];
export type CreateBatchRequestPayload = components['schemas']['CreateBatchRequestPayload'];
export type NurseryWithdrawal = components['schemas']['GetNurseryWithdrawalResponsePayload']['withdrawal'];
export type BatchWithdrawal = NurseryWithdrawal['batchWithdrawals'][0];
export type NurseryWithdrawalPurpose = NurseryWithdrawal['purpose'];
export type BatchHistoryPayload = components['schemas']['BatchHistoryPayload'];

export const NurseryWithdrawalPurposes: { [key: string]: NurseryWithdrawalPurpose } = {
  OUTPLANT: 'Out Plant',
  NURSERY_TRANSFER: 'Nursery Transfer',
  DEAD: 'Dead',
  OTHER: 'Other',
};

export const NurseryWithdrawalPurposesValues = Object.values(NurseryWithdrawalPurposes);

export type NurseryTransfer = components['schemas']['CreateNurseryTransferRequestPayload'];
export type NurseryWithdrawalRequest = components['schemas']['CreateNurseryWithdrawalRequestPayload'];
export type BatchWithdrawalPayload = components['schemas']['BatchWithdrawalPayload'];

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

export const getBatchHistoryTypesEnum = (): BatchHistoryPayload['type'][] => [
  'DetailsEdited',
  'IncomingWithdrawal',
  'OutgoingWithdrawal',
  'PhotoCreated',
  'PhotoDeleted',
  'QuantityEdited',
  'StatusChanged',
];

export const getBatchHistoryTypesLocalized = (): string[] =>
  getBatchHistoryTypesEnum()
    .map((type: BatchHistoryPayload['type']) => batchHistoryEventEnumToLocalized(type))
    .filter((type: string | undefined): type is string => !!type);

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

export const batchHistoryEventLocalizedToEnum = (batchHistoryType: string): BatchHistoryPayload['type'] | undefined => {
  switch (batchHistoryType) {
    case strings.BATCH_HISTORY_TYPE_DETAILS_EDITED: {
      return 'DetailsEdited';
    }
    case strings.BATCH_HISTORY_TYPE_INCOMING_WITHDRAWAL: {
      return 'IncomingWithdrawal';
    }
    case strings.BATCH_HISTORY_TYPE_OUTGOING_WITHDRAWAL: {
      return 'OutgoingWithdrawal';
    }
    case strings.BATCH_HISTORY_TYPE_PHOTO_CREATED: {
      return 'PhotoCreated';
    }
    case strings.BATCH_HISTORY_TYPE_PHOTO_DELETED: {
      return 'PhotoDeleted';
    }
    case strings.BATCH_HISTORY_TYPE_QUANTITY_EDITED: {
      return 'QuantityEdited';
    }
    case strings.BATCH_HISTORY_TYPE_STATUS_CHANGED: {
      return 'StatusChanged';
    }
  }
};
