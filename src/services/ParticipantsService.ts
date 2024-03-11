import { Response2 } from 'src/services/HttpService';
import { Participant } from 'src/types/Participant';

/**
 * Accelerator "participant" related services
 */

const getParticipants = async (): Promise<Response2<Participant[]>> => {
  return {
    requestSucceeded: true,
    data: [],
  };
};

const ParticipantsService = {
  getParticipants,
};

export default ParticipantsService;
