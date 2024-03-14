import { components } from 'src/api/types/generated-schema';

export type VoteOption = 'Yes' | 'No' | 'Conditional';

export type PhaseVotes = components['schemas']['PhaseVotes'];

export type VoteSelection = components['schemas']['VoteSelection'];

export type GetProjectVotesResponsePayload = components['schemas']['GetProjectVotesResponsePayload'];

export type GetProjectVotesResponse = Omit<GetProjectVotesResponsePayload, 'status'>;

export type UpsertProjectVotesRequestPayload = components['schemas']['UpsertProjectVotesRequestPayload'];

export type UpsertVoteSelection = components['schemas']['UpsertVoteSelection'];

export type ProjectVotesPayload = components['schemas']['ProjectVotesPayload'];

export type VotingRecordsData = {
  votes?: ProjectVotesPayload;
};
