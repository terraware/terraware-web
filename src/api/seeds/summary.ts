import axios from '..';
import { SummaryResponse } from '../types/summary';

const BASE_URL = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/summary`;

export const getSummary = async (): Promise<SummaryResponse> => {
  const endpoint = `${BASE_URL}`;

  return (await axios.get(endpoint)).data;
};
