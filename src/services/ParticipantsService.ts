import HttpService, { Response, Response2, ServerData } from 'src/services/HttpService';
import {
  Participant,
  ParticipantCreateRequest,
  ParticipantSearchResult,
  ParticipantUpdateRequest,
} from 'src/types/Participant';
import { SearchNodePayload, SearchRequestPayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';

import SearchService from './SearchService';

const PARTICIPANT_ENDPOINT = '/api/v1/accelerator/participants/{participantId}';
const CREATE_ENDPOINT = '/api/v1/accelerator/participants';

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

const get = async (participantId: number): Promise<Response2<ParticipantData>> =>
  await HttpService.root(PARTICIPANT_ENDPOINT).get2<ParticipantData>({
    urlReplacements: { '{participantId}': `${participantId}` },
  });

const list = async (
  search?: SearchNodePayload,
  sortOrder?: SearchSortOrder
): Promise<ParticipantSearchResult[] | null> => {
  const response: SearchResponseElement[] | null = await SearchService.search(getSearchParams(search, sortOrder));

  if (!response) {
    return null;
  }

  return response.map((result: SearchResponseElement) => {
    const { cohort_id, cohort_name, id, name, projects } = result;

    return {
      cohort_id,
      cohort_name,
      id,
      name,
      projects: projects || [],
    } as ParticipantSearchResult;
  });
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
