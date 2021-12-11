import axios from '..';
import { paths } from 'src/api/types/generated-schema';

const STORAGE_LOCATIONS_ENDPOINT = '/api/v1/seedbank/values/storageLocation/{facilityId}';
type StorageLocationsResponsePayload =
  paths[typeof STORAGE_LOCATIONS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
export type StorageLocation = StorageLocationsResponsePayload['locations'][0];
export type ConditionType = StorageLocation['storageCondition'];

/*
 * getLocations() returns all the storage locations associated with a given facility or null if the
 * API call failed.
 */
export async function getLocations(facilityId: number): Promise<StorageLocation[] | null> {
  try {
    const endpoint = STORAGE_LOCATIONS_ENDPOINT.replace('{facilityId}', `${facilityId}`);
    const response: StorageLocationsResponsePayload = (await axios.get(endpoint)).data;
    return response.locations;
  } catch {
    return null;
  }
}
