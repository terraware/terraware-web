import axios from '..';
import { Accession, NewAccession } from '../types/accessions';

const BASE_URL = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/accession`;

export const getAccession = async (
  accessionId: number
): Promise<Accession> => {
  const endpoint = `${BASE_URL}/${accessionId}`;

  return (await axios.get(endpoint)).data.accession;
};

export const postAccession = async (
  accession: NewAccession
): Promise<Accession> => {
  const endpoint = `${BASE_URL}`;

  return (await axios.post(endpoint, accession)).data.accession;
};

export const putAccession = async (
  accession: Accession
): Promise<Accession> => {
  const endpoint = `${BASE_URL}/${accession.id}`;

  return (await axios.put(endpoint, accession)).data.accession;
};

export const getPhotoEndpoint = (
  accessionId: number,
  photoFilename: string
): string => {
  return `${BASE_URL}/${accessionId}/photo/${photoFilename}`;
};
