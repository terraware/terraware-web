import { paths } from 'src/api/types/generated-schema';
import strings from 'src/strings';
import { StorageLocation } from 'src/types/Facility';
import HttpService, { Response } from './HttpService';
import SearchService, {
  SearchCriteria,
  SearchRequestPayload,
  SearchResponseElement,
  SearchSortOrder,
} from './SearchService';
import { GetUploadStatusResponsePayload, UploadFileResponse } from 'src/types/File';
import { getPromisesResponse } from './utils';

/**
 * Seed bank related services
 */

const SUMMARY_ENDPOINT = '/api/v1/seedbank/summary';
const STORAGE_LOCATIONS_ENDPOINT = '/api/v1/seedbank/storageLocations';
const ACCESSIONS_ENDPOINT = '/api/v2/seedbank/accessions';
const ALL_FIELD_VALUES_ENDPOINT = '/api/v1/seedbank/values/all';
const FIELD_VALUES_ENDPOINT = '/api/v1/seedbank/values';
const ACCESSIONS_TEMPLATE_ENDPOINT = '/api/v2/seedbank/accessions/uploads/template';
const ACCESSIONS_UPLOADS_ENDPOINT = '/api/v2/seedbank/accessions/uploads';
const ACCESSIONS_UPLOAD_STATUS_ENDPOINT = '/api/v2/seedbank/accessions/uploads/{uploadId}';
const ACCESSIONS_UPLOAD_RESOLVE_ENDPOINT = '/api/v2/seedbank/accessions/uploads/{uploadId}/resolve';

type ListAllFieldValuesRequestPayload =
  paths[typeof ALL_FIELD_VALUES_ENDPOINT]['post']['requestBody']['content']['application/json'];
type ListAllFieldValuesResponsePayload =
  paths[typeof ALL_FIELD_VALUES_ENDPOINT]['post']['responses'][200]['content']['application/json'];

type ValuesPostRequestBody = paths[typeof FIELD_VALUES_ENDPOINT]['post']['requestBody']['content']['application/json'];
type ValuesPostResponse = paths[typeof FIELD_VALUES_ENDPOINT]['post']['responses'][200]['content']['application/json'];

type StorageLocationsResponsePayload =
  paths[typeof STORAGE_LOCATIONS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type AllFieldValuesMap = ListAllFieldValuesResponsePayload['results'];
export type FieldValuesMap = ValuesPostResponse['results'];
export const DEFAULT_SEED_SEARCH_FILTERS = {};
export const DEFAULT_SEED_SEARCH_SORT_ORDER = { field: 'receivedDate', direction: 'Descending' } as SearchSortOrder;
export type AccessionsUploadTemplate = {
  template?: string;
};
export type AccessionsUploadStatusDetails = {
  uploadStatus?: GetUploadStatusResponsePayload;
};

/**
 * exported types
 */
export type SeedBankSummary = paths[typeof SUMMARY_ENDPOINT]['get']['responses'][200]['content']['application/json'];
export type Summary = {
  value?: SeedBankSummary;
};
export type SummaryResponse = Response & Summary;

export type StorageLocationsData = {
  storageLocations: StorageLocation[];
};
export type StorageLocationsResponse = Response & StorageLocationsData;

export type StorageLocationData = {
  storageLocation?: StorageLocation;
};
export type StorageLocationResponse = Response & StorageLocationData;

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

const httpStorageLocations = HttpService.root(STORAGE_LOCATIONS_ENDPOINT);

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
 * listAllFieldValues() is a helper function for INTERNAL USE ONLY.
 * DOES NOT DO ANY ERROR HANDLING.
 */
const listAllFieldValues = async (
  entity: ListAllFieldValuesRequestPayload
): Promise<ListAllFieldValuesResponsePayload> => {
  return (await HttpService.root(ALL_FIELD_VALUES_ENDPOINT).post({ entity })).data as ListAllFieldValuesResponsePayload;
};

/**
 * getAllFieldValues() returns all the possible values associated with the requested accession fields.
 * This function does not filter based on which values are currently being used by existing accessions.
 * Returns null if the API request failed.
 *
 * For example, if one of the requested field names was 'stage', this function's return value would
 * include all accession stage options: [dried, drying, in storage, nursery, pending, processed,
 * processing, withdrawn] even if only some stages such as [pending, processed] were being used by
 * existing accessions in the given facility. This example simplifies the input and return type details;
 * see the type definitions for more precise information.
 */
const getAllFieldValues = async (fields: string[], organizationId: number): Promise<AllFieldValuesMap | null> => {
  try {
    const params: ListAllFieldValuesRequestPayload = {
      fields,
      organizationId,
    };
    return (await listAllFieldValues(params)).results;
  } catch {
    return null;
  }
};

/**
 * searchFieldValues() returns values for the specified fields, given that those values are associated
 * with an accession that match the given search criteria. If no search criteria is specified, the default
 * "search" will be "all accession associated with the given organizationId".
 * Returns null if the API request failed.
 */
const searchFieldValues = async (
  fields: string[],
  searchCriteria: SearchCriteria,
  organizationId: number
): Promise<FieldValuesMap | null> => {
  try {
    const formattedSearch = SearchService.convertToSearchNodePayload(searchCriteria, organizationId);
    const entity: ValuesPostRequestBody = {
      fields,
      search: formattedSearch,
    };
    const apiResponse: Response = await HttpService.root(FIELD_VALUES_ENDPOINT).post({ entity });
    return apiResponse.data.results;
  } catch {
    return null;
  }
};

/**
 * Returns all the Collectors associated with an organization id, or undefined if the API request failed.
 */
const getCollectors = async (organizationId: number): Promise<string[] | undefined> => {
  try {
    const params: ListAllFieldValuesRequestPayload = {
      organizationId,
      fields: ['collectors_name'],
    };

    const collectors = (await listAllFieldValues(params)).results.collectors_name.values;
    return collectors.filter((colector) => colector !== null);
  } catch {
    return undefined;
  }
};

/**
 * Get accessions awaiting check-in
 */
const getPendingAccessions = async (organizationId: number): Promise<SearchResponseElement[] | null> => {
  const searchParams: SearchRequestPayload = {
    prefix: 'facilities.accessions',
    fields: ['accessionNumber', 'speciesName', 'collectionSiteName', 'collectedDate', 'receivedDate', 'id'],
    search: SearchService.convertToSearchNodePayload(
      [
        {
          field: 'state',
          values: [strings.AWAITING_CHECK_IN],
          operation: 'field',
        },
      ],
      organizationId
    ),
    sortOrder: [{ field: 'accessionNumber', direction: 'Ascending' }],
    count: 1000,
  };

  return await SearchService.search(searchParams);
};

/**
 * Download accessions template
 */
const downloadAccessionsTemplate = async (): Promise<Response & AccessionsUploadTemplate> => {
  const response: Response & AccessionsUploadTemplate = await HttpService.root(ACCESSIONS_TEMPLATE_ENDPOINT).get<
    any,
    AccessionsUploadTemplate
  >({}, (data) => ({ template: data }));
  return response;
};

/**
 * upload accessions
 */
const uploadAccessions = async (file: File, seedbankId: string): Promise<UploadFileResponse> => {
  const entity = new FormData();
  entity.append('facilityId', seedbankId);
  entity.append('file', file);
  const headers = { 'content-type': 'multipart/form-data' };

  const serverResponse: Response = await HttpService.root(ACCESSIONS_UPLOADS_ENDPOINT).post({ entity, headers });
  const response: UploadFileResponse = {
    ...serverResponse,
    id: serverResponse?.data?.id ?? -1,
  };

  return response;
};

/**
 * check on upload status
 */
const getAccessionsUploadStatus = async (uploadId: number): Promise<Response & AccessionsUploadStatusDetails> => {
  const response: Response & AccessionsUploadStatusDetails = await HttpService.root(
    ACCESSIONS_UPLOAD_STATUS_ENDPOINT
  ).get<GetUploadStatusResponsePayload, AccessionsUploadStatusDetails>(
    {
      urlReplacements: {
        '{uploadId}': uploadId.toString(),
      },
    },
    (data) => ({ uploadStatus: data })
  );

  return response;
};

/**
 * Resolve accessions upload
 */
const resolveAccessionsUpload = async (uploadId: number, overwriteExisting: boolean): Promise<Response> => {
  return await HttpService.root(ACCESSIONS_UPLOAD_RESOLVE_ENDPOINT).post({
    urlReplacements: {
      '{uploadId}': uploadId.toString(),
    },
    params: { overwriteExisting: overwriteExisting.toString() },
  });
};

/*
 * getLocations() returns all the storage locations associated with a given facility or null if the
 * API call failed.
 */
const getStorageLocations = async (seedbankId: number): Promise<StorageLocationsResponse> => {
  const response: StorageLocationsResponse = await httpStorageLocations.get<
    StorageLocationsResponsePayload,
    StorageLocationsData
  >(
    {
      params: {
        facilityId: seedbankId.toString(),
      },
    },
    (data) => ({ storageLocations: data?.storageLocations ?? [] })
  );

  return response;
};

/**
 * Create a single storage location
 */
const createStorageLocation = async (facilityId: number, name: string): Promise<StorageLocationResponse> => {
  const response: Response = await httpStorageLocations.post({
    entity: { facilityId, name },
  });

  return {
    ...response,
    storageLocation: response.data?.storageLocation,
  };
};

/**
 * Create one or more storage locations
 */
const createStorageLocations = async (
  facilityId: number,
  names: string[]
): Promise<(StorageLocationResponse | null)[]> => {
  const promises = names.map((name) => createStorageLocation(facilityId, name));
  return getPromisesResponse<StorageLocationResponse>(promises);
};

/**
 * Exported functions
 */
const SeedBankService = {
  getSummary,
  createAccession,
  searchAccessions,
  searchFieldValues,
  getAllFieldValues,
  getCollectors,
  getPendingAccessions,
  downloadAccessionsTemplate,
  uploadAccessions,
  getAccessionsUploadStatus,
  resolveAccessionsUpload,
  getStorageLocations,
  createStorageLocation,
  createStorageLocations,
};

export default SeedBankService;
