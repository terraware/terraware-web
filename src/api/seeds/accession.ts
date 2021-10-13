import axios from '..';
import {
  Accession,
  accessionEndpoint,
  AccessionGetResponse,
  AccessionPostRequestBody,
  AccessionPostResponse,
  AccessionPutRequestBody,
  photoEndpoint,
  postAccessionEndpoint,
} from '../types/accessions';

export const getAccession = async (accessionId: number): Promise<Accession> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${accessionEndpoint}`.replace('{id}', `${accessionId}`);
  const response: AccessionGetResponse = (await axios.get(endpoint)).data;

  return response.accession;
};

export const postAccession = async (accession: AccessionPostRequestBody): Promise<number> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${postAccessionEndpoint}`;
  const response: AccessionPostResponse = (await axios.post(endpoint, accession)).data;

  return response.accession.id;
};

export const putAccession = async (accessionId: number, accession: AccessionPutRequestBody): Promise<void> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${accessionEndpoint}`.replace('{id}', `${accessionId}`);
  await axios.put(endpoint, accession);
};

export const getPhotoEndpoint = (accessionId: number, photoFilename: string): string => {
  return `${process.env.REACT_APP_TERRAWARE_API}${photoEndpoint}`.replace('{id}', `${accessionId}`).replace('{photoFilename}', `${photoFilename}`);
};
