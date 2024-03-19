import { Response2 } from 'src/services/HttpService';
import { Participant } from 'src/types/Participant';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

/**
 * Accelerator "participant" related services
 */

export type ParticipantsData = {
  participants: Participant[];
};

export type ParticipantData = {
  participant: Participant;
};

const deleteOne = async (participantId: number): Promise<Response2<number>> => {
  return {
    requestSucceeded: true,
    data: participantId,
  };
};

let mockParticipant: Participant = {
  id: 1,
  cohort_id: 1,
  name: `TST_PART1`,
};

const get = async (participantId: number): Promise<Response2<ParticipantData>> => {
  return {
    requestSucceeded: true,
    data: {
      participant: mockParticipant,
    },
  };
};

const list = async (
  locale?: string | null,
  search?: SearchNodePayload,
  sortOrder?: SearchSortOrder
): Promise<Response2<ParticipantsData>> => {
  return {
    requestSucceeded: true,
    data: {
      participants: [
        {
          id: 1,
          cohort_id: 1,
          name: 'TST_PART1',
        },
        {
          id: 2,
          cohort_id: 1,
          name: 'TST_PART2',
        },
      ],
    },
  };
};

const update = async (participant: Participant): Promise<Response2<number>> => {
  mockParticipant = participant;
  return {
    requestSucceeded: true,
    data: participant.id,
  };
};

const ParticipantsService = {
  deleteOne,
  get,
  list,
  update,
};

export default ParticipantsService;
