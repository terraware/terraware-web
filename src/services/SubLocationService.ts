import { paths } from 'src/api/types/generated-schema';
import { SubLocation } from 'src/types/Facility';

import HttpService, { Response } from './HttpService';

/**
 * Sub-locations CRUD
 */

const SUB_LOCATIONS_ENDPOINT = '/api/v1/facilities/{facilityId}/subLocations';

type StorageLocationsResponsePayload =
  paths[typeof SUB_LOCATIONS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

/**
 * exported types
 */

type SubLocationsData = {
  subLocations: SubLocation[];
};
export type SubLocationsResponse = Response & SubLocationsData;

const httpSubLocations = HttpService.root(SUB_LOCATIONS_ENDPOINT);

/*
 * Returns all the sub-locations associated with a given facility or null if the API call failed.
 */
const getSubLocations = async (facilityId: number): Promise<SubLocationsResponse> => {
  const response: SubLocationsResponse = await httpSubLocations.get<StorageLocationsResponsePayload, SubLocationsData>(
    {
      urlReplacements: {
        '{facilityId}': facilityId.toString(),
      },
    },
    (data) => ({ subLocations: data?.subLocations ?? [] })
  );

  return response;
};

/**
 * Exported functions
 */
const SubLocationService = {
  getSubLocations,
};

export default SubLocationService;
