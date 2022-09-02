import axios from 'axios';
import { paths } from '../types/generated-schema';

const ACCESSIONS2_ROOT_ENDPOINT = '/api/v2/seedbank/accessions';
const ACCESSIONS2_ENDPOINT = '/api/v2/seedbank/accessions/{id}';

type ListAutomationsResponsePayload =
  paths[typeof ACCESSIONS2_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type Accession2 = ListAutomationsResponsePayload['accession'];

export const Accession2Status = [
  'Awaiting Check-In',
  'Pending',
  'Awaiting Processing',
  'Processing',
  'Cleaning',
  'Processed',
  'Drying',
  'Dried',
  'In Storage',
  'Withdrawn',
  'Used Up',
  'Nursery',
];

export const getAccession2 = async (accessionId: number): Promise<Accession2> => {
  const endpoint = ACCESSIONS2_ENDPOINT.replace('{id}', `${accessionId}`);
  const response: ListAutomationsResponsePayload = (await axios.get(endpoint)).data;

  return response.accession;
};

type UpdateAcccessionResponse = {
  requestSucceeded: boolean;
};

type UpdateAccessionResponsePayloadV2 =
  paths[typeof ACCESSIONS2_ENDPOINT]['put']['responses'][200]['content']['application/json'];

export const updateAccession2 = async (accession: Accession2): Promise<UpdateAcccessionResponse> => {
  const response: UpdateAcccessionResponse = {
    requestSucceeded: true,
  };
  const endpoint = ACCESSIONS2_ENDPOINT.replace('{id}', `${accession.id}`);
  try {
    const serverResponse: UpdateAccessionResponsePayloadV2 = (await axios.put(endpoint, accession)).data;
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
