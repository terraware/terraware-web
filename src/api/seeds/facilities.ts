import axios from '..';
import { Facilities } from '../types/facilities';

export const getAllFacilities = async (): Promise<Facilities> => {
  const endpoint = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/facility`;

  return (await axios.get(endpoint)).data.facilities;
};
