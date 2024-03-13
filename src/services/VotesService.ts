import HttpService, { Response, Response2 } from 'src/services/HttpService';
import { GetProjectVotesResponsePayload, UpsertProjectVotesRequestPayload, VotingRecordsData } from 'src/types/Votes';

/**
 * Accelerator "voting" related services
 */

// TODO: remove this constant and promises below once BE is ready
const RETURN_MOCK_VOTING_DATA = true;

const ENDPOINT_VOTES = '/api/v1/accelerator/projects/{projectId}/votes';

const httpVoting = HttpService.root(ENDPOINT_VOTES);

let mockGetProjectVotesResponseData: VotingRecordsData;

const getProjectVotes = async (projectId: number): Promise<Response2<VotingRecordsData>> =>
  RETURN_MOCK_VOTING_DATA
    ? new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockGetProjectVotesResponseData, requestSucceeded: true });
        }, 300);
      })
    : await httpVoting.get<GetProjectVotesResponsePayload, VotingRecordsData>(
        {
          urlReplacements: { '{projectId}': `${projectId}` },
        },
        (data) => ({ votes: data })
      );

const setProjectVotes = async (projectId: number, payload: UpsertProjectVotesRequestPayload): Promise<Response> =>
  RETURN_MOCK_VOTING_DATA
    ? new Promise<Response>((resolve) => {
        setTimeout(() => {
          resolve({ requestSucceeded: true });
        }, 300);
      })
    : await httpVoting.put({
        urlReplacements: { '{projectId}': `${projectId}` },
        entity: payload,
      });

const VotesService = {
  getProjectVotes,
  setProjectVotes,
};

export default VotesService;

// TODO: remove mock data once BE is ready
mockGetProjectVotesResponseData = {
  votes: {
    projectId: 1,
    projectName: 'Project 1',
    phases: [
      {
        phase: 'Phase 1 - Feasibility Study',
        votes: [
          { userId: 1, voteOption: 'Yes', email: 'person1@example.com', firstName: '', lastName: '' },
          { userId: 2, voteOption: 'No', email: 'person2@example.com', firstName: '', lastName: '' },
          {
            userId: 3,
            voteOption: 'Conditional',
            email: 'person3@example.com',
            firstName: '',
            lastName: '',
            conditionalInfo:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.\n\nSed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam.',
          },
          { userId: 4, voteOption: 'Yes', email: 'person4@example.com', firstName: '', lastName: '' },
          { userId: 5, voteOption: 'No', email: 'person5@example.com', firstName: '', lastName: '' },
        ],
      },
      {
        phase: 'Phase 2 - Plan and Scale',
        votes: [
          { userId: 1, voteOption: 'Yes', email: 'person1@example.com', firstName: '', lastName: '' },
          { userId: 2, voteOption: 'No', email: 'person2@example.com', firstName: '', lastName: '' },
          { userId: 3, voteOption: 'Yes', email: 'person3@example.com', firstName: '', lastName: '' },
          { userId: 4, voteOption: 'Yes', email: 'person4@example.com', firstName: '', lastName: '' },
          { userId: 5, voteOption: 'Yes', email: 'person5@example.com', firstName: '', lastName: '' },
        ],
      },
    ],
  },
};
