import axios from '..';
import {paths} from 'src/api/types/generated-schema';

const STORAGE_LOCATIONS_ENDPOINT = '/api/v1/seedbank/values/storageLocation/{facilityId}';
type StorageLocationsResponsePayload =
  paths[typeof STORAGE_LOCATIONS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
export type StorageLocation = StorageLocationsResponsePayload['locations'][0];
export type ConditionType = StorageLocation['storageCondition'];

export const getLocations = async (facilityId: number): Promise<StorageLocation[]> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${STORAGE_LOCATIONS_ENDPOINT}`.replace(
    '{facilityId}',
    `${facilityId}`
  );
  const response: StorageLocationsResponsePayload = (await axios.get(endpoint)).data;

  return response.locations;
};
