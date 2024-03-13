import { components } from 'src/api/types/generated-schema';

export type CohortPhase = string;

export type PhaseVotes = {
  cohortPhase: CohortPhase;
  votes: VoteSelection[];
};

export type DeleteProjectVotesRequestPayload = {
  options: DeleteVoteSelection;
};

export type DeleteProjectVotesResponsePayload = components['schemas']['SimpleSuccessResponsePayload'];

export type DeleteVoteSelection = {
  projectId: number;
  phase?: CohortPhase;
  userId?: number;
};

export type GetProjectVotesResponsePayload = {
  projectId: number;
  projectName: string;
  phases: PhaseVotes[];
};

export type GetProjectVotesResponse = {
  votes: GetProjectVotesResponsePayload;
  status: 'ok' | 'error';
};

export type UpsertProjectVotesRequestPayload = {
  votes: UpsertVoteSelection[];
};

export type UpsertProjectVotesResponsePayload = {
  projectId: number;
  results: UpsertVoteSelection[];
};

export type UpsertProjectVotesResponse = {
  votes: UpsertProjectVotesResponsePayload;
  status: 'ok' | 'error';
};

export type UpsertVoteSelection = {
  projectId: number;
  phase: CohortPhase;
  userId: number;
  voteOption?: VoteOption;
};

export type VoteOption = 'yes' | 'no' | 'conditional';

export type VoteSelection = {
  conditionalInfo?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  userId: number;
  voteOption?: VoteOption;
};

export type VotingRecordsData = {
  votes: GetProjectVotesResponsePayload | undefined;
};
