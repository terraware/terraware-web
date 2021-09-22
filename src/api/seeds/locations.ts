import axios from '..';
import { Locations } from '../types/locations';

export const getLocations = async (): Promise<Locations> => {
  const endpoint = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/values/storageLocation`;

  return (await axios.get(endpoint)).data.locations;
};
