import { components } from 'src/api/types/generated-schema';

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
