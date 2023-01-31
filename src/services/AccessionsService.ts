import { paths } from 'src/api/types/generated-schema';
import { Accession } from 'src/types/Accession';
import HttpService, { Response } from './HttpService';
import SearchService, {
  SearchCriteria,
  SearchRequestPayload,
  SearchResponseElement,
  SearchSortOrder,
} from './SearchService';

/**
 * Service for accessions related functionality
 */

const ACCESSIONS_ENDPOINT = '/api/v2/seedbank/accessions';
const ACCESSION_ENDPOINT = '/api/v2/seedbank/accessions/{id}';
const ACCESSION_HISTORY_ENDPOINT = '/api/v1/seedbank/accessions/{id}/history';
const ACCESSION_CHECKIN_ENDPOINT = '/api/v1/seedbank/accessions/{id}/checkIn';

export type AccessionPostRequestBody =
  paths[typeof ACCESSIONS_ENDPOINT]['post']['requestBody']['content']['application/json'];

type AccessionPostResponse = paths[typeof ACCESSIONS_ENDPOINT]['post']['responses'][200]['content']['application/json'];

type GetAccessionHistoryResponsePayload =
  paths[typeof ACCESSION_HISTORY_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type AccessionHistory = GetAccessionHistoryResponsePayload['history'];

export type AccessionHistoryEntry = Required<AccessionHistory>[0];

export type AccessionData = { accession?: Accession };
export type AccessionResponse = Response & AccessionData;
export type CreateAccessionResponse = Response & {
  id: number;
};
export type HistoryData = { history?: AccessionHistoryEntry[] };
export type AccessionHistoryResponse = Response & HistoryData;
export type AccessionsSearchParams = {
  organizationId: number;
  fields: string[];
  searchCriteria?: SearchCriteria;
  sortOrder?: SearchSortOrder;
};

const httpAccessions = HttpService.root(ACCESSIONS_ENDPOINT);
const httpAccession = HttpService.root(ACCESSION_ENDPOINT);
const httpAccessionHistory = HttpService.root(ACCESSION_HISTORY_ENDPOINT);
const httpAccessionCheckin = HttpService.root(ACCESSION_CHECKIN_ENDPOINT);

/**
 * Get an accession by id
 */
const getAccession = async (accessionId: number): Promise<AccessionResponse> => {
  const response: AccessionResponse = await httpAccession.get<AccessionPostResponse, AccessionData>(
    {
      urlReplacements: { '{id}': accessionId.toString() },
    },
    (data) => ({ accession: data?.accession })
  );

  return response;
};

/**
 * Update an accession by id
 */
const updateAccession = async (entity: Accession, simulate?: boolean): Promise<AccessionResponse> => {
  const params = { simulate: simulate !== undefined ? simulate.toString() : 'false' };
  const serverResponse: Response = await httpAccession.put({
    entity,
    params,
    urlReplacements: { '{id}': entity.id.toString() },
  });
  const response: AccessionResponse = { ...serverResponse, accession: serverResponse?.data?.accession };

  return response;
};

/**
 * Create an accession
 */
const createAccession = async (entity: AccessionPostRequestBody): Promise<CreateAccessionResponse> => {
  const serverResponse: Response = await httpAccessions.post({ entity });
  const response: CreateAccessionResponse = { ...serverResponse, id: serverResponse.data?.accession?.id ?? -1 };

  return response;
};

/**
 * Accessions history
 */
const getAccessionHistory = async (accessionId: number): Promise<AccessionHistoryResponse> => {
  const response: Response = await httpAccessionHistory.get<GetAccessionHistoryResponsePayload, HistoryData>(
    {
      urlReplacements: { '{id}': accessionId.toString() },
    },
    (data) => ({ history: data?.history })
  );

  return response;
};

/**
 * Check-in an accession
 */
const checkInAccession = async (accessionId: number): Promise<Response> => {
  return await httpAccessionCheckin.post({
    urlReplacements: { '{id}': accessionId.toString() },
  });
};

/**
 * Delete an accession
 */
const deleteAccession = async (accessionId: number): Promise<Response> => {
  return await httpAccession.delete({
    urlReplacements: { '{id}': accessionId.toString() },
  });
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
const AccessionsService = {
  createAccession,
  getAccession,
  getAccessionHistory,
  checkInAccession,
  updateAccession,
  deleteAccession,
  searchAccessions,
};

export default AccessionsService;
