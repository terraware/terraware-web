import { paths, components } from './generated-schema';
const BATCHES = '/api/v1/nursery/batches';
const BATCH_WITHDRAWALS = '/api/v1/nursery/withdrawals';

export type Batch = paths[typeof BATCHES]['post']['responses'][200]['content']['application/json']['batch'];

export type CreateBatchRequestPayload = paths[typeof BATCHES]['post']['requestBody']['content']['application/json'];

export type NurseryWithdrawal =
  paths[typeof BATCH_WITHDRAWALS]['post']['responses'][200]['content']['application/json']['withdrawal'];

export type BatchWithdrawal =
  paths[typeof BATCH_WITHDRAWALS]['post']['responses'][200]['content']['application/json']['withdrawal']['batchWithdrawals'][0];

export type NurseryWithdrawalPurpose =
  paths[typeof BATCH_WITHDRAWALS]['post']['responses'][200]['content']['application/json']['withdrawal']['purpose'];

export const schemas = 'schemas';
export type NurseryTransfer = components[typeof schemas]['CreateNurseryTransferRequestPayload'];
export type NurseryWithdrawalRequest = components[typeof schemas]['CreateNurseryWithdrawalRequestPayload'];
