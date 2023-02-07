import { components } from 'src/api/types/generated-schema';

const schemas = 'schemas';

export type Batch = components[typeof schemas]['BatchResponsePayload']['batch'];
export type CreateBatchRequestPayload = components[typeof schemas]['CreateBatchRequestPayload'];
export type NurseryWithdrawal = components[typeof schemas]['GetNurseryWithdrawalResponsePayload']['withdrawal'];
export type BatchWithdrawal = NurseryWithdrawal['batchWithdrawals'][0];
export type NurseryWithdrawalPurpose = NurseryWithdrawal['purpose'];

export const NurseryWithdrawalPurposes: { [key: string]: NurseryWithdrawalPurpose } = {
  OUTPLANT: 'Out Plant',
  NURSERY_TRANSFER: 'Nursery Transfer',
  DEAD: 'Dead',
  OTHER: 'Other',
};

export const NurseryWithdrawalPurposesValues = Object.values(NurseryWithdrawalPurposes);

export type NurseryTransfer = components[typeof schemas]['CreateNurseryTransferRequestPayload'];
export type NurseryWithdrawalRequest = components[typeof schemas]['CreateNurseryWithdrawalRequestPayload'];
