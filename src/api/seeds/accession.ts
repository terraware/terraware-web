import axios from '..';
import {
  Accession,
  accessionEndpoint,
  AccessionGetResponse,
  AccessionPostRequestBody,
  AccessionPostResponse,
  AccessionPutRequestBody,
  checkInEndpoint,
  photoEndpoint,
  postAccessionEndpoint,
} from '../types/accessions';
import { paths } from '../types/generated-schema';

export const getAccession = async (accessionId: number): Promise<Accession> => {
  const endpoint = accessionEndpoint.replace('{id}', `${accessionId}`);
  const response: AccessionGetResponse = (await axios.get(endpoint)).data;

  return response.accession;
};

export const postAccession = async (accession: AccessionPostRequestBody): Promise<number> => {
  const response: AccessionPostResponse = (await axios.post(postAccessionEndpoint, accession)).data;

  return response.accession.id;
};

export const putAccession = async (accessionId: number, accession: AccessionPutRequestBody): Promise<void> => {
  const endpoint = accessionEndpoint.replace('{id}', `${accessionId}`);
  await axios.put(endpoint, accession);
};

export const getPhotoEndpoint = (accessionId: number, photoFilename: string): string => {
  return photoEndpoint.replace('{id}', `${accessionId}`).replace('{photoFilename}', `${photoFilename}`);
};

export const checkIn = async (id: number): Promise<Accession> => {
  const endpoint = checkInEndpoint.replace('{id}', `${id}`);

  return (await axios.post(endpoint)).data;
};

type DeleteAcccessionResponse = {
  requestSucceeded: boolean;
};

type SimpleSuccessResponsePayload =
  paths[typeof accessionEndpoint]['delete']['responses'][200]['content']['application/json'];

export const deleteAccession = async (accessionId: number): Promise<DeleteAcccessionResponse> => {
  const response = {
    requestSucceeded: true,
  };
  const endpoint = accessionEndpoint.replace('{id}', `${accessionId}`);
  try {
    const serverResponse: SimpleSuccessResponsePayload = await axios.delete(endpoint);
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};
