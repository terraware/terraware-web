import axios from '.';
import { Accession, NewAccession } from './types/accessions';

const BASE_URL = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/accession`;

export const getAccession = async (
  accessionNumber: string
): Promise<Accession> => {
  const endpoint = `${BASE_URL}/${accessionNumber}`;
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
  const endpoint = `${BASE_URL}/${accession.accessionNumber}`;
  return (await axios.put(endpoint, accession)).data.accession;
};

export const getPhotoEndpoint = (
  accessionNumber: string,
  photoFilename: string
): string => {
  return `${BASE_URL}/${accessionNumber}/photo/${photoFilename}`;
};
