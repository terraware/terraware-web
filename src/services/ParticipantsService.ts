import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response, Response2, ServerData } from 'src/services/HttpService';
import { Participant, ParticipantCreateRequest, ParticipantUpdateRequest } from 'src/types/Participant';
import { SearchNodePayload, SearchRequestPayload, SearchSortOrder } from 'src/types/Search';
import { SearchOrderConfig, searchAndSort } from 'src/utils/searchAndSort';

import SearchService from './SearchService';

const PARTICIPANTS_ENDPOINT = '/api/v1/accelerator/participants';
const PARTICIPANT_ENDPOINT = '/api/v1/accelerator/participants/{participantId}';
const CREATE_ENDPOINT = '/api/v1/accelerator/participants';

type ListParticipantsResponsePayload =
  paths[typeof PARTICIPANTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

/**
 * Accelerator "participant" related services
 */

export type ParticipantData = ServerData & {
  participant: Participant;
};

// utility to map search/sort into search params for participants
const getSearchParams = (search?: SearchNodePayload, sortOrder?: SearchSortOrder): SearchRequestPayload => {
  const searchParams: SearchRequestPayload = {
    prefix: 'projects.participant',
    fields: ['cohort_id', 'cohort_name', 'id', 'name', 'projects.id', 'projects.name'],
    search: search ?? { operation: 'and', children: [] },
    sortOrder: [sortOrder ?? { field: 'name' }],
    count: 0,
  };

  return searchParams;
};

const create = async (entity: ParticipantCreateRequest): Promise<Response2<ParticipantData>> =>
  await HttpService.root(CREATE_ENDPOINT).post({ entity });

const deleteOne = async (participantId: number): Promise<Response> =>
  await HttpService.root(PARTICIPANT_ENDPOINT).delete({
    urlReplacements: { '{participantId}': `${participantId}` },
  });

/**
 * Download csv of participants data.
 */
const download = async (search?: SearchNodePayload, sortOrder?: SearchSortOrder): Promise<string | null> =>
  await SearchService.searchCsv(getSearchParams(search, sortOrder));

const get = async (participantId: number): Promise<Response2<ParticipantData>> => {
  const response = await HttpService.root(PARTICIPANT_ENDPOINT).get2<ParticipantData>({
    urlReplacements: { '{participantId}': `${participantId}` },
  });

  if (!(response.requestSucceeded && response.data?.participant)) {
    return response;
  }

  return {
    ...response,
    data: {
      participant: response.data.participant,
    },
  };
};

const list = async (
  locale?: string,
  search?: SearchNodePayload,
  sortOrder?: SearchSortOrder
): Promise<ListParticipantsResponsePayload> => {
  let searchOrderConfig: SearchOrderConfig | undefined;
  if (sortOrder) {
    searchOrderConfig = {
      locale: locale ?? null,
      sortOrder: sortOrder,
      numberFields: ['cohortId', 'id'],
    };
  }

  const response = await HttpService.root(PARTICIPANTS_ENDPOINT).get2<ListParticipantsResponsePayload>();

  if (!response || !response.requestSucceeded || !response.data) {
    return Promise.reject(response);
  }

  return {
    status: response.data.status,
    participants: searchAndSort(response.data.participants, search, searchOrderConfig),
  };
};

const update = async (participantId: number, entity: ParticipantUpdateRequest): Promise<Response> =>
  await HttpService.root(PARTICIPANT_ENDPOINT).put({
    urlReplacements: { '{participantId}': `${participantId}` },
    entity,
  });

const ParticipantsService = {
  create,
  deleteOne,
  download,
  get,
  list,
  update,
};

export default ParticipantsService;
