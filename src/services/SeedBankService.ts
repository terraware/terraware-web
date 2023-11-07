import { paths } from 'src/api/types/generated-schema';
import strings from 'src/strings';
import HttpService, { Response } from './HttpService';
import SearchService, { SearchRequestPayload } from './SearchService';
import { SearchCriteria, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { GetUploadStatusResponsePayload, UploadFileResponse } from 'src/types/File';

/**
 * Seed bank related services
 */

const SUMMARY_ENDPOINT = '/api/v1/seedbank/summary';
const ACCESSIONS_ENDPOINT = '/api/v2/seedbank/accessions';
const FIELD_VALUES_ENDPOINT = '/api/v1/seedbank/values';
const ACCESSIONS_TEMPLATE_ENDPOINT = '/api/v2/seedbank/accessions/uploads/template';
const ACCESSIONS_UPLOADS_ENDPOINT = '/api/v2/seedbank/accessions/uploads';
const ACCESSIONS_UPLOAD_STATUS_ENDPOINT = '/api/v2/seedbank/accessions/uploads/{uploadId}';
const ACCESSIONS_UPLOAD_RESOLVE_ENDPOINT = '/api/v2/seedbank/accessions/uploads/{uploadId}/resolve';

type ValuesPostRequestBody = paths[typeof FIELD_VALUES_ENDPOINT]['post']['requestBody']['content']['application/json'];
type ValuesPostResponse = paths[typeof FIELD_VALUES_ENDPOINT]['post']['responses'][200]['content']['application/json'];

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
    const collectors =
      (await searchFieldValues(['collectors_name'], {}, organizationId))?.collectors_name?.values || [];
    return collectors.filter((collector) => collector !== null) as string[];
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

/**
 * Exported functions
 */
const SeedBankService = {
  getSummary,
  createAccession,
  searchAccessions,
  searchFieldValues,
  getCollectors,
  getPendingAccessions,
  downloadAccessionsTemplate,
  uploadAccessions,
  getAccessionsUploadStatus,
  resolveAccessionsUpload,
};

export default SeedBankService;
