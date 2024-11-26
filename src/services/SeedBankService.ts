import { paths } from 'src/api/types/generated-schema';
import strings from 'src/strings';
import { AccessionState } from 'src/types/Accession';
import { GetUploadStatusResponsePayload, UploadFileResponse } from 'src/types/File';
import {
  SearchCriteria,
  SearchNodePayload,
  SearchRequestPayload,
  SearchResponseElement,
  SearchResponseElementWithId,
  SearchSortOrder,
  SearchValuesResponseElement,
} from 'src/types/Search';
import { UnitType } from 'src/units';

import HttpService, { Response } from './HttpService';
import PhotoService, { PhotoId } from './PhotoService';
import SearchService from './SearchService';
import { getPromisesResponse } from './utils';

/**
 * Seed bank related services
 */

const SUMMARY_ENDPOINT = '/api/v1/seedbank/summary';
const ACCESSIONS_ENDPOINT = '/api/v2/seedbank/accessions';
const ACCESSION_PHOTO_ENDPOINT = '/api/v1/seedbank/accessions/{accessionId}/photos/{photoFilename}';
const ACCESSION_PHOTOS_ENDPOINT = '/api/v1/seedbank/accessions/{accessionId}/photos';
const ACCESSIONS_TEMPLATE_ENDPOINT = '/api/v2/seedbank/accessions/uploads/template';
const ACCESSIONS_UPLOADS_ENDPOINT = '/api/v2/seedbank/accessions/uploads';
const ACCESSIONS_UPLOAD_STATUS_ENDPOINT = '/api/v2/seedbank/accessions/uploads/{uploadId}';
const ACCESSIONS_UPLOAD_RESOLVE_ENDPOINT = '/api/v2/seedbank/accessions/uploads/{uploadId}/resolve';

export type FieldValuesMap = SearchValuesResponseElement;
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

export type SearchResponseAccession = {
  id: string;
  accessionNumber: string;
  estimatedCount?: string;
  'estimatedCount(raw)'?: string;
  remainingQuantity?: string;
  'remainingQuantity(raw)'?: string;
  remainingUnits?: UnitType;
  speciesName: string;
  state: AccessionState;
};

const SEARCH_FIELDS_ACCESSIONS = [
  'id',
  'accessionNumber',
  'estimatedCount',
  'estimatedCount(raw)',
  'remainingQuantity',
  'remainingQuantity(raw)',
  'remainingUnits',
  'speciesName',
  'state',
];

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
const searchAccessions = async <T extends SearchResponseElement>({
  organizationId,
  fields,
  searchCriteria,
  sortOrder,
}: AccessionsSearchParams): Promise<T[] | null> => {
  const params: SearchRequestPayload = {
    prefix: 'facilities.accessions',
    fields,
    search: SearchService.convertToSearchNodePayload(searchCriteria ?? {}, organizationId),
    count: 1000,
  };

  if (sortOrder) {
    params.sortOrder = [sortOrder];
  }

  return SearchService.search<T>(params);
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
    const params: SearchRequestPayload = {
      prefix: 'facilities.accessions',
      fields,
      search: SearchService.convertToSearchNodePayload(searchCriteria ?? {}, organizationId),
      count: 1000,
    };
    return await SearchService.searchValues(params);
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
 * Returns all the CollectionSiteName values associated with an organization id, or undefined if the API request failed.
 */
const getCollectionSiteNames = async (organizationId: number): Promise<string[] | undefined> => {
  try {
    const collectionSiteNames =
      (await searchFieldValues(['collectionSiteName'], {}, organizationId))?.collectionSiteName?.values || [];
    return collectionSiteNames.filter((collectionSiteName) => collectionSiteName !== null) as string[];
  } catch {
    return undefined;
  }
};

/**
 * Get accessions awaiting check-in
 */
const getPendingAccessions = async (organizationId: number): Promise<SearchResponseElementWithId[] | null> => {
  const searchParams: SearchRequestPayload = {
    prefix: 'facilities.accessions',
    fields: ['accessionNumber', 'speciesName', 'collectionSiteName', 'collectedDate', 'receivedDate', 'id'],
    search: SearchService.convertToSearchNodePayload(
      [
        {
          operation: 'field',
          field: 'state',
          type: 'Exact',
          values: [strings.AWAITING_CHECK_IN],
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
 * upload accession photos
 */
const uploadAccessionPhotos = async (
  accessionId: number,
  photos: File[]
): Promise<((Response & PhotoId) | string)[]> => {
  const url = ACCESSION_PHOTOS_ENDPOINT.replace('{accessionId}', accessionId.toString());
  return PhotoService.uploadPhotos(url, photos, true);
};

/**
 * Delete multiple photos for an accession
 */
const deleteAccessionPhotos = async (accessionId: number, photoFilenames: string[]): Promise<(Response | null)[]> => {
  const deletePhotoPromises = photoFilenames.map((photoFilename) => deleteAccessionPhoto(accessionId, photoFilename));

  return getPromisesResponse<Response>(deletePhotoPromises);
};

/**
 * delete accession photo
 */
const deleteAccessionPhoto = async (accessionId: number, photoFilename: string): Promise<Response> => {
  return await HttpService.root(ACCESSION_PHOTO_ENDPOINT).delete({
    urlReplacements: {
      '{accessionId}': accessionId.toString(),
      '{photoFilename}': photoFilename,
    },
  });
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

const getAccessionForSpecies = (
  organizationId: number,
  speciesId: number
): Promise<SearchResponseAccession[] | null> => {
  const searchCriteria: { [key: string]: SearchNodePayload } = {};

  searchCriteria.excludeUsedUp = {
    operation: 'not',
    child: {
      operation: 'field',
      field: 'state',
      type: 'Exact',
      values: [strings.USED_UP],
    },
  };

  if (speciesId !== -1) {
    searchCriteria.speciesIds = {
      operation: 'field',
      field: 'species_id',
      type: 'Exact',
      values: [speciesId.toString()],
    };
  }

  return SeedBankService.searchAccessions({
    organizationId,
    fields: SEARCH_FIELDS_ACCESSIONS,
    searchCriteria,
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
  getCollectionSiteNames,
  getPendingAccessions,
  downloadAccessionsTemplate,
  uploadAccessions,
  uploadAccessionPhotos,
  deleteAccessionPhotos,
  getAccessionsUploadStatus,
  resolveAccessionsUpload,
  getAccessionForSpecies,
};

export default SeedBankService;
