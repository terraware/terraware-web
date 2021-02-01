/* eslint-disable no-console */
import axios from 'axios';
import { NewAccession } from './types/accessions';
import { operations } from './types/generated-schema';

type CreateAccession = operations["create"];

export const postAccession = async (
  accession: NewAccession
): Promise<CreateAccession["responses"]["200"]["content"]["application/json"]> => {
  const endpoint = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/accession`;
  return await (await axios.post(endpoint, accession)).data;
};