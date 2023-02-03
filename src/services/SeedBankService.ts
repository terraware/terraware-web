import { paths } from 'src/api/types/generated-schema';
import { StorageLocationDetails } from 'src/types/Facility';
import HttpService, { Response } from './HttpService';

/**
 * Seed bank related services
 */

const SUMMARY_ENDPOINT = '/api/v1/seedbank/summary';
const STORAGE_LOCATIONS_ENDPOINT = '/api/v1/seedbank/values/storageLocation/{facilityId}';

/**
 * exported types
 */
export type SeedBankSummary = paths[typeof SUMMARY_ENDPOINT]['get']['responses'][200]['content']['application/json'];
export type Summary = {
  value?: SeedBankSummary;
};
export type SummaryResponse = Response & Summary;

export type StorageLocations = {
  locations: StorageLocationDetails[];
};
export type StorageLocationsResponse = Response & StorageLocations;

/**
 * Seed bank summary
 */
const getSummary = async (organizationId: number): Promise<SummaryResponse> => {
  const response: SummaryResponse = await HttpService.root(SUMMARY_ENDPOINT).get<SeedBankSummary, Summary>(
    {
      params: {
        organizationId: organizationId.toString(),
      },
    },
    (data) => ({ value: data })
  );

  return response;
};

type StorageLocationsResponsePayload =
  paths[typeof STORAGE_LOCATIONS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

/*
 * getLocations() returns all the storage locations associated with a given facility or null if the
 * API call failed.
 */
const getStorageLocations = async (facilityId: number): Promise<StorageLocationsResponse> => {
  const response: StorageLocationsResponse = await HttpService.root(STORAGE_LOCATIONS_ENDPOINT).get<
    StorageLocationsResponsePayload,
    StorageLocations
  >(
    {
      urlReplacements: {
        '{facilityId}': facilityId.toString(),
      },
    },
    (data) => ({ locations: data?.locations ?? [] })
  );

  return response;
};

/**
 * Exported functions
 */
const SeedBankService = {
  getSummary,
  getStorageLocations,
};

export default SeedBankService;
