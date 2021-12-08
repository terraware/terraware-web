import axios from '..';
import { StorageLocation, storageLocationEndpoint, StorageLocationListResponse } from '../types/locations';

export const getLocations = async (facilityId: number): Promise<StorageLocation[]> => {
  const endpoint = storageLocationEndpoint.replace('{facilityId}', `${facilityId}`);
  const response: StorageLocationListResponse = (await axios.get(endpoint)).data;

  return response.locations;
};
