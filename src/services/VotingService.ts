import HttpService, { Response, Response2 } from 'src/services/HttpService';
import {
  EnterVotingRecordRequestPayload,
  EnterVotingRecordResponsePayload,
  ListVotingRecordsResponsePayload,
  ProjectVotesPayload,
  VotingRecord,
  VotingRecordsData,
} from 'src/types/Voting';

/**
 * Accelerator "voting" related services
 */

// TODO: update endpoints and types once BE is ready

const ENDPOINT_VOTING = '/api/v1/accelerator/projects/{projectId}/voting';

const httpVoting = HttpService.root(ENDPOINT_VOTING);

let mockListRecordsResponseData: ProjectVotesPayload;

const listRecords = async (_projectId: number): Promise<Response2<ProjectVotesPayload>> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockListRecordsResponseData, requestSucceeded: true });
    }, 300);
  });

const listRecordsNEXT = async (projectId: number): Promise<Response & VotingRecordsData> =>
  httpVoting.get<ListVotingRecordsResponsePayload, VotingRecordsData>(
    {
      urlReplacements: { '{projectId}': `${projectId}` },
    },
    (response) => ({ votes: response?.votes })
  );

const submitVote = async (_projectId: number, _record: EnterVotingRecordRequestPayload): Promise<Response> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({ requestSucceeded: true });
    }, 300);
  });

const submitVoteNEXT = async (projectId: number, record: VotingRecord): Promise<Response> =>
  httpVoting.put2<EnterVotingRecordResponsePayload>({
    urlReplacements: { '{projectId}': `${projectId}` },
    entity: record,
  });

const VotingService = {
  listRecords,
  listRecordsNEXT,
  submitVote,
  submitVoteNEXT,
};

export default VotingService;

// TODO: remove mock data once BE is ready
mockListRecordsResponseData = {
  projectId: 1,
  phases: [
    {
      cohortPhase: 'phase 1',
      votes: [
        { userId: 1, voteOption: 'yes', email: 'person1@example.com', firstName: '', lastName: '' },
        { userId: 2, voteOption: 'no', email: 'person2@example.com', firstName: '', lastName: '' },
        { userId: 3, voteOption: 'conditional', email: 'person3@example.com', firstName: '', lastName: '' },
        { userId: 4, voteOption: 'yes', email: 'person4@example.com', firstName: '', lastName: '' },
        { userId: 5, voteOption: 'no', email: 'person5@example.com', firstName: '', lastName: '' },
      ],
    },
    {
      cohortPhase: 'phase 2',
      votes: [
        { userId: 1, voteOption: 'yes', email: 'person1@example.com', firstName: '', lastName: '' },
        { userId: 2, voteOption: 'no', email: 'person2@example.com', firstName: '', lastName: '' },
        { userId: 3, voteOption: 'yes', email: 'person3@example.com', firstName: '', lastName: '' },
        { userId: 4, voteOption: 'yes', email: 'person4@example.com', firstName: '', lastName: '' },
        { userId: 5, voteOption: 'yes', email: 'person5@example.com', firstName: '', lastName: '' },
      ],
    },
  ],
};
