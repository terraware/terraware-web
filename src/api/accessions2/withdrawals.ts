import axios from 'axios';
import { paths } from '../types/generated-schema';
import { addError } from './utils';

const WITHDRAWALS_ENDPOINT = '/api/v2/seedbank/accessions/{accessionId}/withdrawals';

export type WithdrawalsPostRequest =
  paths[typeof WITHDRAWALS_ENDPOINT]['post']['requestBody']['content']['application/json'];

export type WithdrawalsPostResponse =
  paths[typeof WITHDRAWALS_ENDPOINT]['post']['responses'][200]['content']['application/json'];

type CreateWithdrawalResponse = {
  requestSucceeded: boolean;
  error?: string;
};

export const postWithdrawal = async (
  withdrawal: WithdrawalsPostRequest,
  accessionId: number
): Promise<CreateWithdrawalResponse> => {
  const response: CreateWithdrawalResponse = {
    requestSucceeded: true,
  };

  try {
    const serverResponse: WithdrawalsPostResponse = (
      await axios.post(WITHDRAWALS_ENDPOINT.replace('{accessionId}', accessionId.toString()), withdrawal)
    ).data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
      addError(serverResponse, response);
    }
  } catch (e: any) {
    response.requestSucceeded = false;
    addError(e?.response?.data || {}, response);
  }

  return response;
};

const TRANSFER_TO_NURSERY = '/api/v2/seedbank/accessions/{accessionId}/transfers/nursery';

export type TransferToNurseryRequestBody =
  paths[typeof TRANSFER_TO_NURSERY]['post']['requestBody']['content']['application/json'];

type NurseryTransferResponse = {
  requestSucceeded: boolean;
  error?: string;
};

export const transferToNursery = async (
  request: TransferToNurseryRequestBody,
  accessionId: number
): Promise<NurseryTransferResponse> => {
  const response: NurseryTransferResponse = {
    requestSucceeded: true,
  };

  try {
    await axios.post(TRANSFER_TO_NURSERY.replace('{accessionId}', accessionId.toString()), request);
  } catch (e: any) {
    response.requestSucceeded = false;
    addError(e?.response?.data || {}, response);
  }

  return response;
};
