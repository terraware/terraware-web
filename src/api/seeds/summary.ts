import axios from '..';
import { SummaryResponse } from '../types/summary';

const BASE_URL = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/summary`;

export const getSummary = async (facilityId: number): Promise<SummaryResponse> => {
  const endpoint = `${BASE_URL}/${facilityId}`;

  return (await axios.get(endpoint)).data;
};
