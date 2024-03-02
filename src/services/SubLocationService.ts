import _ from 'lodash';

import { paths } from 'src/api/types/generated-schema';
import { PartialSubLocation, SubLocation } from 'src/types/Facility';
import { Id } from 'src/types/Id';

import HttpService, { Response } from './HttpService';
import { getPromisesResponse } from './utils';

/**
 * Sub-locations CRUD
 */

const SUB_LOCATIONS_ENDPOINT = '/api/v1/facilities/{facilityId}/subLocations';
const SUB_LOCATION_ENDPOINT = '/api/v1/facilities/{facilityId}/subLocations/{subLocationId}';

type StorageLocationsResponsePayload =
  paths[typeof SUB_LOCATIONS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type SubLocationResponsePayload =
  paths[typeof SUB_LOCATION_ENDPOINT]['get']['responses'][200]['content']['application/json'];

/**
 * exported types
 */

export type SubLocationsData = {
  subLocations: SubLocation[];
};
export type SubLocationsResponse = Response & SubLocationsData;

export type SubLocationData = {
  subLocation?: SubLocation;
};
export type SubLocationResponse = Response & SubLocationData;

export type SubLocationUpdateRequestBody =
  paths[typeof SUB_LOCATION_ENDPOINT]['put']['requestBody']['content']['application/json'];

const httpSubLocations = HttpService.root(SUB_LOCATIONS_ENDPOINT);
const httpStorageLocation = HttpService.root(SUB_LOCATION_ENDPOINT);

/**
 * Create a single sub-location
 */
const createSubLocation = async (facilityId: number, name: string): Promise<SubLocationResponse> => {
  const response: Response = await httpSubLocations.post({
    urlReplacements: {
      '{facilityId}': facilityId.toString(),
    },
    entity: { name },
  });

  return {
    ...response,
    subLocation: response.data?.subLocation,
  };
};

/**
 * Create one or more sub-locations
 */
const createSubLocations = async (facilityId: number, names: string[]): Promise<(SubLocationResponse | null)[]> => {
  const promises = names.map((name) => createSubLocation(facilityId, name));
  return getPromisesResponse<SubLocationResponse>(promises);
};

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

const saveEditedSubLocations = async (facilityId: number, editedSubLocations: PartialSubLocation[]) => {
  const isEqual = (location1: PartialSubLocation, location2: PartialSubLocation) => {
    return location1.id === location2.id;
  };

  const isModified = (location1: PartialSubLocation, location2: PartialSubLocation) => {
    return location1.id === location2.id && location1.name !== location2.name;
  };

  /**
   * Find existing locations and pick out the ones to delete, create and update.
   * Use bulk API to delete, create, update.
   */
  const response = await getSubLocations(facilityId);
  if (response.requestSucceeded) {
    const { subLocations } = response;
    const toDelete = _.differenceWith(subLocations, editedSubLocations, isEqual);
    const toCreate = _.differenceWith(editedSubLocations, subLocations, isEqual);
    const toUpdate = _.intersectionWith(editedSubLocations, subLocations, isModified);

    const promises = [];
    if (toDelete.length) {
      promises.push(
        deleteSubLocations(
          facilityId,
          toDelete.map((l) => l.id)
        )
      );
    }
    if (toUpdate.length) {
      promises.push(updateSubLocations(facilityId, toUpdate as { name: string; id: number }[]));
    }
    if (toCreate.length) {
      promises.push(
        createSubLocations(
          facilityId,
          toCreate.map((l) => l.name as string)
        )
      );
    }

    await Promise.allSettled(promises);
  }
};

/**
 * Exported functions
 */
const SubLocationService = {
  createSubLocation,
  createSubLocations,
  getSubLocation,
  getSubLocations,
  updateSubLocation,
  deleteSubLocation,
  updateSubLocations,
  deleteSubLocations,
  saveEditedSubLocations,
};

export default SubLocationService;
