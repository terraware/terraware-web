import { Participant } from 'src/types/Participant';
import { Response2 } from 'src/services/HttpService';

/**
 * Accelerator "participant" related services
 */

const getParticipants = async (): Promise<Response2<Participant[]>> => {
  // TODO change this over once BE is done
  return {
    requestSucceeded: true,
    data: [
      {
        id: 1,
        cohort_id: 12,
        name: 'CMR_Iroko',
      },
    ],
  };
};

const ParticipantsService = {
  getParticipants,
};

export default ParticipantsService;
