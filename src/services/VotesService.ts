import HttpService, { Response2 } from 'src/services/HttpService';
import {
  DeleteProjectVotesRequestPayload,
  DeleteProjectVotesResponsePayload,
  GetProjectVotesResponse,
  GetProjectVotesResponsePayload,
  UpsertProjectVotesRequestPayload,
  UpsertProjectVotesResponsePayload,
  VotingRecordsData,
} from 'src/types/Votes';

/**
 * Accelerator "voting" related services
 */

// TODO: remove this constant and promises below once BE is ready
const RETURN_MOCK_VOTING_DATA = true;

const ENDPOINT_VOTES = '/api/v1/accelerator/projects/{projectId}/votes';

const httpVoting = HttpService.root(ENDPOINT_VOTES);

let mockGetProjectVotesResponseData: GetProjectVotesResponsePayload;
let mockSetProjectVotesResponseData: UpsertProjectVotesResponsePayload;

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

const getProjectVotes = async (projectId: number): Promise<Response2<GetProjectVotesResponsePayload>> =>
  RETURN_MOCK_VOTING_DATA
    ? new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockGetProjectVotesResponseData, requestSucceeded: true });
        }, 300);
      })
    : httpVoting.get<GetProjectVotesResponse, VotingRecordsData>(
        {
          urlReplacements: { '{projectId}': `${projectId}` },
        },
        (response) => ({ votes: response?.votes })
      );

const setProjectVotes = async (
  projectId: number,
  payload: UpsertProjectVotesRequestPayload
): Promise<Response2<UpsertProjectVotesResponsePayload>> =>
  RETURN_MOCK_VOTING_DATA
    ? new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockSetProjectVotesResponseData, requestSucceeded: true });
        }, 300);
      })
    : httpVoting.put2<UpsertProjectVotesResponsePayload>({
        urlReplacements: { '{projectId}': `${projectId}` },
        entity: payload,
      });

const VotesService = {
  deleteProjectVotes,
  getProjectVotes,
  setProjectVotes,
};

export default VotesService;

// TODO: remove mock data once BE is ready
mockGetProjectVotesResponseData = {
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

mockSetProjectVotesResponseData = {
  projectId: 1,
  results: [
    { projectId: 1, phase: 'phase 1', userId: 1, voteOption: 'yes' },
    { projectId: 1, phase: 'phase 1', userId: 2, voteOption: 'no' },
    { projectId: 1, phase: 'phase 1', userId: 3, voteOption: 'conditional' },
    { projectId: 1, phase: 'phase 1', userId: 4, voteOption: 'yes' },
    { projectId: 1, phase: 'phase 1', userId: 5, voteOption: 'no' },
  ],
};
