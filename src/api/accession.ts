import axios from '.';
import { Accession, NewAccession } from './types/accessions';

const BASE_URL = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/accession`;
const BASE_URL_2 = `${process.env.REACT_APP_SEED_BANK_API}/api/v2/seedbank/accession`;

export const getAccession = async (
  accessionNumber: string
): Promise<Accession> => {
  const endpoint = `${BASE_URL_2}/${accessionNumber}`;
  return (await axios.get(endpoint)).data.accession;
};

export const postAccession = async (
  accession: NewAccession
): Promise<Accession> => {
  const endpoint = `${BASE_URL_2}`;
  return (await axios.post(endpoint, accession)).data.accession;
};

export const putAccession = async (
  accession: Accession
): Promise<Accession> => {
  const endpoint = `${BASE_URL_2}/${accession.accessionNumber}`;
  return (await axios.put(endpoint, accession)).data.accession;
};

export const getPhotoEndpoint = (
  accessionNumber: string,
  photoFilename: string
): string => {
  return `${BASE_URL}/${accessionNumber}/photo/${photoFilename}`;
};
