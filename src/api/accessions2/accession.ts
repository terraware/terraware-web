import axios from 'axios';
import { paths } from '../types/generated-schema';

const ACCESSIONS2_ROOT_ENDPOINT = '/api/v2/seedbank/accessions';
const ACCESSIONS2_ENDPOINT = '/api/v2/seedbank/accessions/{id}';
const HISTORY_ENDPOINT = '/api/v1/seedbank/accessions/{id}/history';

type ListAutomationsResponsePayload =
  paths[typeof ACCESSIONS2_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type Accession2 = ListAutomationsResponsePayload['accession'];

export type Withdrawal2 = Required<Accession2>['withdrawals'][0];

export const getAccession2 = async (accessionId: number): Promise<Accession2> => {
  const endpoint = ACCESSIONS2_ENDPOINT.replace('{id}', `${accessionId}`);
  const response: ListAutomationsResponsePayload = (await axios.get(endpoint)).data;

  return response.accession;
};

type UpdateAcccessionResponse = {
  requestSucceeded: boolean;
  accession: Accession2 | undefined;
};

type UpdateAccessionResponsePayloadV2 =
  paths[typeof ACCESSIONS2_ENDPOINT]['put']['responses'][200]['content']['application/json'];

type updateAccessionQuery = paths[typeof ACCESSIONS2_ENDPOINT]['put']['parameters']['query'];

export const updateAccession2 = async (
  accession: Accession2,
  simulate?: boolean
): Promise<UpdateAcccessionResponse> => {
  const queryParams: updateAccessionQuery = {
    simulate: simulate !== undefined ? simulate.toString() : 'false',
  };

  const response: UpdateAcccessionResponse = {
    requestSucceeded: true,
    accession: undefined,
  };
  const endpoint = ACCESSIONS2_ENDPOINT.replace('{id}', `${accession.id}`);
  try {
    const serverResponse: UpdateAccessionResponsePayloadV2 = (
      await axios.put(endpoint, accession, { params: queryParams })
    ).data;
    response.accession = serverResponse.accession;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};

type AccessionPostResponse =
  paths[typeof ACCESSIONS2_ROOT_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type AccessionPostRequestBody =
  paths[typeof ACCESSIONS2_ROOT_ENDPOINT]['post']['requestBody']['content']['application/json'];

type CreateAccessionResponse = {
  requestSucceeded: boolean;
  id: number;
};

export const postAccession = async (accession: AccessionPostRequestBody): Promise<CreateAccessionResponse> => {
  const response: CreateAccessionResponse = {
    requestSucceeded: true,
    id: 0,
  };

  try {
    const serverResponse: AccessionPostResponse = (await axios.post(ACCESSIONS2_ROOT_ENDPOINT, accession)).data;
    response.id = serverResponse.accession.id;
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};

/**
 * Accessions history
 */
type GetAccessionHistoryResponsePayload =
  paths[typeof HISTORY_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type AccessionHistory = GetAccessionHistoryResponsePayload['history'];

export type AccessionHistoryEntry = Required<AccessionHistory>[0];

type ListAccessionHistoryResponse = {
  requestSucceeded: boolean;
  history?: AccessionHistoryEntry[];
};

export const getAccessionHistory = async (accessionId: number): Promise<ListAccessionHistoryResponse> => {
  const endpoint = HISTORY_ENDPOINT.replace('{id}', `${accessionId}`);
  const response: ListAccessionHistoryResponse = {
    requestSucceeded: true,
  };

  try {
    const serverResponse: GetAccessionHistoryResponsePayload = (await axios.get(endpoint)).data;
    response.history = serverResponse.history;
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};
