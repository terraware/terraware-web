/* eslint-disable no-console */
import axios from 'axios';
import { Accession, NewAccession } from './types/accessions';
import { operations } from './types/generated-schema';

type GetAccession = operations["read"];
type CreateAccession = operations["create"];
type UpdateAccession = operations["update"];

export const getAccession = async (
  accessionNumber: string
): Promise<GetAccession["responses"]["200"]["content"]["application/json"]> => {
  const endpoint = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/accession/${accessionNumber}`;
  return await (await axios.get(endpoint)).data;
};

export const postAccession = async (
  accession: NewAccession
): Promise<CreateAccession["responses"]["200"]["content"]["application/json"]> => {
  const endpoint = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/accession`;
  return await (await axios.post(endpoint, accession)).data;
};

export const putAccession = async (
  accession: Accession
): Promise<UpdateAccession["responses"]["200"]["content"]["application/json"]> => {
  const endpoint = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/accession/${accession.accessionNumber}`;
  return await (await axios.put(endpoint, accession)).data;
};