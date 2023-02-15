import { paths } from 'src/api/types/generated-schema';
import { StorageLocation } from 'src/types/Facility';
import { Id } from 'src/types/Id';
import HttpService, { Response } from './HttpService';
import { getPromisesResponse } from './utils';

/**
 * Seed bank related services
 */

const STORAGE_LOCATION_ENDPOINT = '/api/v1/seedbank/storageLocations/{id}';

type StorageLocationResponsePayload =
  paths[typeof STORAGE_LOCATION_ENDPOINT]['get']['responses'][200]['content']['application/json'];

/**
 * exported types
 */

export type StorageLocationData = {
  storageLocation?: StorageLocation;
};
export type StorageLocationResponse = Response & StorageLocationData;

export type StorageLocationUpdateRequestBody =
  paths[typeof STORAGE_LOCATION_ENDPOINT]['put']['requestBody']['content']['application/json'];

const httpStorageLocation = HttpService.root(STORAGE_LOCATION_ENDPOINT);

/**
 * Get a single storage location
 */
const getStorageLocation = async (locationId: number): Promise<StorageLocationResponse> => {
  const response: StorageLocationResponse = await httpStorageLocation.get<
    StorageLocationResponsePayload,
    StorageLocationData
  >(
    {
      urlReplacements: {
        '{id}': locationId.toString(),
      },
    },
    (data) => ({ storageLocation: data?.storageLocation })
  );

  return response;
};

/**
 * Update a single storage location
 */
const updateStorageLocation = async (locationId: number, name: string): Promise<Response> => {
  return await httpStorageLocation.put({
    urlReplacements: {
      '{id}': locationId.toString(),
    },
    entity: { name },
  });
};

/**
 * Delete a single storage location
 */
const deleteStorageLocation = async (locationId: number): Promise<Response> => {
  return await httpStorageLocation.delete({
    urlReplacements: {
      '{id}': locationId.toString(),
    },
  });
};

/**
 * Update one or more storage locations
 */
const updateStorageLocations = async (
  locations: (StorageLocationUpdateRequestBody & Id)[]
): Promise<(Response | null)[]> => {
  const promises = locations.map((location) => updateStorageLocation(location.id, location.name));
  return getPromisesResponse<Response>(promises);
};

/**
 * Delete one or more storage locations
 */
const deleteStorageLocations = async (locationIds: number[]): Promise<(Response | null)[]> => {
  const promises = locationIds.map((locationId) => deleteStorageLocation(locationId));
  return getPromisesResponse<Response>(promises);
};

/**
 * Exported functions
 */
const StorageLocationService = {
  getStorageLocation,
  updateStorageLocation,
  deleteStorageLocation,
  updateStorageLocations,
  deleteStorageLocations,
};

export default StorageLocationService;
