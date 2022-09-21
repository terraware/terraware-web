import axios from 'axios';
import { paths } from '../types/generated-schema';

const WITHDRAWALS_ENDPOINT = '/api/v2/seedbank/accessions/{accessionId}/withdrawals';

export type WithdrawalsPostRequest =
  paths[typeof WITHDRAWALS_ENDPOINT]['post']['requestBody']['content']['application/json'];

export type WithdrawalsPostResponse =
  paths[typeof WITHDRAWALS_ENDPOINT]['post']['responses'][200]['content']['application/json'];

type CreateWithdrawalResponse = {
  requestSucceeded: boolean;
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
    }
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};
