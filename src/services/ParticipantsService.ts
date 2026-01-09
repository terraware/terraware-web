import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response2, ServerData } from 'src/services/HttpService';
import { Participant } from 'src/types/Participant';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchOrderConfig, searchAndSort } from 'src/utils/searchAndSort';

const PARTICIPANTS_ENDPOINT = '/api/v1/accelerator/participants';
const PARTICIPANT_ENDPOINT = '/api/v1/accelerator/participants/{participantId}';

type ListParticipantsResponsePayload =
  paths[typeof PARTICIPANTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

/**
 * Accelerator "participant" related services
 */

export type ParticipantData = ServerData & {
  participant: Participant;
};

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
      sortOrder,
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

const ParticipantsService = {
  get,
  list,
};

export default ParticipantsService;
