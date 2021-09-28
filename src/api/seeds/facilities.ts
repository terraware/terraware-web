import axios from '..';
import { Facilities } from '../types/facilities';

export const getAllFacilities = async (): Promise<Facilities> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/facility`;

  return (await axios.get(endpoint)).data.facilities;
};
