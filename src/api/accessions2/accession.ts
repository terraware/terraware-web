import axios from 'axios';
import { paths } from '../types/generated-schema';

const ACCESSIONS2_ENDPOINT = '/api/v2/seedbank/accessions/{id}';

type ListAutomationsResponsePayload =
  paths[typeof ACCESSIONS2_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type Accession2 = ListAutomationsResponsePayload['accession'];

export const getAccession2 = async (accessionId: number): Promise<Accession2> => {
  const endpoint = ACCESSIONS2_ENDPOINT.replace('{id}', `${accessionId}`);
  const response: ListAutomationsResponsePayload = (await axios.get(endpoint)).data;

  return response.accession;
};
