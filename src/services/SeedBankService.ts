import { paths } from 'src/api/types/generated-schema';
import { StorageLocationDetails } from 'src/types/Facility';
import HttpService, { Response } from './HttpService';
import SearchService, {
  SearchCriteria,
  SearchRequestPayload,
  SearchResponseElement,
  SearchSortOrder,
} from './SearchService';

/**
 * Seed bank related services
 */

const SUMMARY_ENDPOINT = '/api/v1/seedbank/summary';
const STORAGE_LOCATIONS_ENDPOINT = '/api/v1/seedbank/values/storageLocation/{facilityId}';
const ACCESSIONS_ENDPOINT = '/api/v2/seedbank/accessions';

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

export type AccessionPostRequestBody =
  paths[typeof ACCESSIONS_ENDPOINT]['post']['requestBody']['content']['application/json'];

export type CreateAccessionResponse = Response & {
  id: number;
};

export type AccessionsSearchParams = {
  organizationId: number;
  fields: string[];
  searchCriteria?: SearchCriteria;
  sortOrder?: SearchSortOrder;
};

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
 * Create an accession
 */
const createAccession = async (entity: AccessionPostRequestBody): Promise<CreateAccessionResponse> => {
  const httpAccessions = HttpService.root(ACCESSIONS_ENDPOINT);
  const serverResponse: Response = await httpAccessions.post({ entity });
  const response: CreateAccessionResponse = { ...serverResponse, id: serverResponse.data?.accession?.id ?? -1 };

  return response;
};

/**
 * Search accessions
 */
const searchAccessions = async ({
  organizationId,
  fields,
  searchCriteria,
  sortOrder,
}: AccessionsSearchParams): Promise<SearchResponseElement[] | null> => {
  const params: SearchRequestPayload = {
    prefix: 'facilities.accessions',
    fields,
    search: SearchService.convertToSearchNodePayload(searchCriteria ?? {}, organizationId),
    count: 1000,
  };

  if (sortOrder) {
    params.sortOrder = [sortOrder];
  }

  return await SearchService.search(params);
};

/**
 * Exported functions
 */
const SeedBankService = {
  getSummary,
  getStorageLocations,
  createAccession,
  searchAccessions,
};

export default SeedBankService;
