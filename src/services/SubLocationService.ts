import { paths } from 'src/api/types/generated-schema';
import { SubLocation } from 'src/types/Facility';
import { Id } from 'src/types/Id';
import HttpService, { Response } from './HttpService';
import { getPromisesResponse } from './utils';

/**
 * Seed bank related services
 */

const SUB_LOCATION_ENDPOINT = '/api/v1/facilities/{facilityId}/subLocations/{subLocationId}';

type SubLocationResponsePayload =
  paths[typeof SUB_LOCATION_ENDPOINT]['get']['responses'][200]['content']['application/json'];

/**
 * exported types
 */

export type SubLocationData = {
  subLocation?: SubLocation;
};
export type SubLocationResponse = Response & SubLocationData;

export type SubLocationUpdateRequestBody =
  paths[typeof SUB_LOCATION_ENDPOINT]['put']['requestBody']['content']['application/json'];

const httpStorageLocation = HttpService.root(SUB_LOCATION_ENDPOINT);

/**
 * Get a single sub-location
 */
const getSubLocation = async (facilityId: number, locationId: number): Promise<SubLocationResponse> => {
  const response: SubLocationResponse = await httpStorageLocation.get<SubLocationResponsePayload, SubLocationData>(
    {
      urlReplacements: {
        '{facilityId}': facilityId.toString(),
        '{subLocationId}': locationId.toString(),
      },
    },
    (data) => ({ subLocation: data?.subLocation })
  );

  return response;
};

/**
 * Update a single sub-location
 */
const updateSubLocation = async (facilityId: number, locationId: number, name: string): Promise<Response> => {
  return await httpStorageLocation.put({
    urlReplacements: {
      '{facilityId}': facilityId.toString(),
      '{subLocationId}': locationId.toString(),
    },
    entity: { name },
  });
};

/**
 * Delete a single sub-location
 */
const deleteSubLocation = async (facilityId: number, locationId: number): Promise<Response> => {
  return await httpStorageLocation.delete({
    urlReplacements: {
      '{facilityId}': facilityId.toString(),
      '{subLocationId}': locationId.toString(),
    },
  });
};

/**
 * Update one or more sub-locations
 */
const updateSubLocations = async (
  facilityId: number,
  locations: (SubLocationUpdateRequestBody & Id)[]
): Promise<(Response | null)[]> => {
  const promises = locations.map((location) => updateSubLocation(facilityId, location.id, location.name));
  return getPromisesResponse<Response>(promises);
};

/**
 * Delete one or more sub-locations
 */
const deleteSubLocations = async (facilityId: number, locationIds: number[]): Promise<(Response | null)[]> => {
  const promises = locationIds.map((locationId) => deleteSubLocation(facilityId, locationId));
  return getPromisesResponse<Response>(promises);
};

/**
 * Exported functions
 */
const SubLocationService = {
  getSubLocation,
  updateSubLocation,
  deleteSubLocation,
  updateSubLocations,
  deleteSubLocations,
};

export default SubLocationService;
