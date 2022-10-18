import axios from 'axios';
import { addError } from '../accessions2/utils';
import { paths } from '../types/generated-schema';

const BATCHES = '/api/v1/nursery/batches';
type CreateBatchResponsePayload = paths[typeof BATCHES]['post']['responses'][200]['content']['application/json'];

export type CreateBatchRequestPayload = paths[typeof BATCHES]['post']['requestBody']['content']['application/json'];

type CreateBatchResponse = {
  batchId: number | null;
  requestSucceeded: boolean;
  error?: string;
};

export async function createBatch(batch: CreateBatchRequestPayload): Promise<CreateBatchResponse> {
  const response: CreateBatchResponse = {
    batchId: null,
    requestSucceeded: true,
  };

  try {
    const serverResponse: CreateBatchResponsePayload = (await axios.post(BATCHES, batch)).data;
    if (serverResponse.status === 'ok') {
      response.batchId = serverResponse.batch.id;
    } else {
      response.requestSucceeded = false;
    }
  } catch (e: any) {
    addError(e?.response?.data || {}, response);
    response.requestSucceeded = false;
  }

  return response;
}
