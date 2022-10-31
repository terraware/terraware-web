import axios from '..';
import { accessionEndpoint, checkInEndpoint, photoEndpoint } from '../types/accessions';
import { paths } from '../types/generated-schema';
import { Accession2 } from 'src/api/accessions2/accession';

export const getPhotoEndpoint = (accessionId: number, photoFilename: string): string => {
  return photoEndpoint.replace('{id}', `${accessionId}`).replace('{photoFilename}', `${photoFilename}`);
};

export const checkIn = async (id: number): Promise<Accession2> => {
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
