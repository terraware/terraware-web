import { Response2 } from 'src/services/HttpService';
import { Participant } from 'src/types/Participant';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchOrderConfig, searchAndSort } from 'src/utils/searchAndSort';

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
  cohort_name: 'Cohort1',
  name: `TST_PART1`,
  projects: [
    { id: 1, name: 'Project1', organization_id: 1, organization_name: 'Org1' },
    { id: 7, name: 'Andromeda', organization_id: 2, organization_name: 'Org2' },
  ],
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
  let searchOrderConfig: SearchOrderConfig | undefined;

  if (locale && sortOrder) {
    searchOrderConfig = {
      locale,
      sortOrder,
      numberFields: ['id', 'cohort_id'],
    };
  }

  return {
    requestSucceeded: true,
    data: {
      participants: searchAndSort(
        [
          {
            id: 1,
            cohort_id: 1,
            cohort_name: 'Cohort1',
            name: 'TST_PART1',
            projects: [
              { id: 1, name: 'Project1', organization_id: 1, organization_name: 'Org1' },
              { id: 7, name: 'Andromeda', organization_id: 2, organization_name: 'Org2' },
            ],
          },
          {
            id: 2,
            cohort_id: 2,
            cohort_name: 'Cohort2',
            name: 'TST_PART2',
            projects: [
              { id: 2, name: 'Project2', organization_id: 2, organization_name: 'Org2' },
              { id: 3, name: 'Project3', organization_id: 2, organization_name: 'Org2' },
              { id: 4, name: 'Project4', organization_id: 2, organization_name: 'Org2' },
              { id: 5, name: 'Project5', organization_id: 3, organization_name: 'Org3' },
              { id: 6, name: 'Project6', organization_id: 3, organization_name: 'Org3' },
            ],
          },
          {
            id: 3,
            cohort_id: 3,
            cohort_name: 'Cohort3',
            name: 'random',
            projects: [{ id: 8, name: 'Project8', organization_id: 1, organization_name: 'Org1' }],
          },
        ],
        search,
        searchOrderConfig
      ),
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
