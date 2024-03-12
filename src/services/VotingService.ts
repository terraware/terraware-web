import HttpService, { Response, Response2 } from 'src/services/HttpService';
import {
  DeleteProjectVotesRequestPayload,
  DeleteProjectVotesResponsePayload,
  ProjectVotesPayload,
  ProjectVotesResponsePayload,
  UpsertVoteSelection,
  VotingRecordsData,
} from 'src/types/Voting';

/**
 * Accelerator "voting" related services
 */

// TODO: remove this constant and promises below once BE is ready
const RETURN_MOCK_VOTING_DATA = true;

const ENDPOINT_VOTES = '/api/v1/accelerator/projects/{projectId}/votes';

const httpVoting = HttpService.root(ENDPOINT_VOTES);

let mockListRecordsResponseData: ProjectVotesPayload;

const deleteProjectVotes = async (
  projectId: number,
  payload: DeleteProjectVotesRequestPayload
): Promise<Response2<DeleteProjectVotesResponsePayload>> =>
  RETURN_MOCK_VOTING_DATA
    ? new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: { status: 'ok' }, requestSucceeded: true });
        }, 300);
      })
    : httpVoting.delete2<DeleteProjectVotesResponsePayload>({
        urlReplacements: { '{projectId}': `${projectId}` },
        entity: payload,
      });

const getProjectVotes = async (projectId: number): Promise<Response2<ProjectVotesPayload>> =>
  RETURN_MOCK_VOTING_DATA
    ? new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockListRecordsResponseData, requestSucceeded: true });
        }, 300);
      })
    : httpVoting.get<ProjectVotesResponsePayload, VotingRecordsData>(
        {
          urlReplacements: { '{projectId}': `${projectId}` },
        },
        (response) => ({ votes: response?.votes })
      );

const setProjectVotes = async (projectId: number, payload: UpsertVoteSelection): Promise<Response> =>
  RETURN_MOCK_VOTING_DATA
    ? new Promise((resolve) => {
        setTimeout(() => {
          resolve({ requestSucceeded: true });
        }, 300);
      })
    : httpVoting.put2<ProjectVotesResponsePayload>({
        urlReplacements: { '{projectId}': `${projectId}` },
        entity: payload,
      });

const VotingService = {
  deleteProjectVotes,
  getProjectVotes,
  setProjectVotes,
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
