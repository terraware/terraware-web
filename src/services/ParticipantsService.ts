import HttpService, { Response2, ServerData } from 'src/services/HttpService';
import { Participant } from 'src/types/Participant';

const PARTICIPANT_ENDPOINT = '/api/v1/accelerator/participants/{participantId}';

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

const ParticipantsService = {
  get,
};

export default ParticipantsService;
