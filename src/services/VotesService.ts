import HttpService, { Response, Response2 } from 'src/services/HttpService';
import { GetProjectVotesResponsePayload, UpsertProjectVotesRequestPayload, VotingRecordsData } from 'src/types/Votes';

/**
 * Accelerator "voting" related services
 */

const ENDPOINT_VOTES = '/api/v1/accelerator/projects/{projectId}/votes';

const httpVoting = HttpService.root(ENDPOINT_VOTES);

const getProjectVotes = async (projectId: number): Promise<Response2<VotingRecordsData>> =>
  await httpVoting.get<GetProjectVotesResponsePayload, Response2<VotingRecordsData>>(
    {
      urlReplacements: { '{projectId}': `${projectId}` },
    },
    (data) => ({ data: { votes: data?.votes }, requestSucceeded: true })
  );

const setProjectVotes = async (projectId: number, payload: UpsertProjectVotesRequestPayload): Promise<Response> =>
  await httpVoting.put({
    urlReplacements: { '{projectId}': `${projectId}` },
    entity: payload,
  });

const VotesService = {
  getProjectVotes,
  setProjectVotes,
};

export default VotesService;
