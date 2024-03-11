import HttpService, { Response, Response2 } from 'src/services/HttpService';
import {
  EnterVotingRecordRequestPayload,
  EnterVotingRecordResponsePayload,
  ListVotingRecordsResponsePayload,
  VotingRecord,
  VotingRecordsData,
} from 'src/types/Voting';

/**
 * Accelerator "voting" related services
 */

// TODO: update endpoints and types once BE is ready

const ENDPOINT_VOTING = '/api/v1/accelerator/projects/{projectId}/voting';

const httpVoting = HttpService.root(ENDPOINT_VOTING);

let mockListRecordsResponseData: VotingRecord[] = [];

const listRecords = async (projectId: number): Promise<Response2<VotingRecord[]>> =>
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

const submitVote = async (projectId: number, record: EnterVotingRecordRequestPayload): Promise<Response> =>
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

mockListRecordsResponseData = [
  { field: 'person 1', value: 'yes' },
  { field: 'person 2', value: 'no' },
  { field: 'person 3', value: 'conditional' },
  { field: 'person 4', value: 'yes' },
  { field: 'person 5', value: 'no' },
];
