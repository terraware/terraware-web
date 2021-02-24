import axios from '.';
import { Locations } from './types/locations';

export const getLocations = async (): Promise<Locations> => {
  const endpoint = '/api/v1/seedbank/values/storageLocation';
  return (await axios.get(endpoint)).data.locations;
};
