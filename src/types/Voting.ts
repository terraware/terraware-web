type CohortPhase = string;

type CohortVotes = {
  cohortPhase: CohortPhase;
  votes: VoteSelection[];
};

export type DeleteProjectVotesRequestPayload = {
  options: DeleteVoteSelection;
};

export type DeleteProjectVotesResponsePayload = components['schemas']['SimpleSuccessResponsePayload'];

export type DeleteVoteSelection = {
  projectId: number;
  phase: CohortPhase;
  userId: number;
};

export type ProjectVotesPayload = {
  projectId: number;
  phases: CohortVotes[];
};

export type ProjectVotesResponsePayload = {
  votes: ProjectVotesPayload;
  status: 'ok' | 'error';
};

export type UpsertProjectVotesRequestPayload = {
  votes: UpsertVoteSelection;
};

export type UpsertVoteSelection = {
  projectId: number;
  phase: CohortPhase;
  userId: number;
  voteOption: VoteOption;
};

type VoteOption = 'yes' | 'no' | 'conditional';

type VoteSelection = {
  email?: string;
  firstName?: string;
  lastName?: string;
  userId: number;
  voteOption: VoteOption;
};

export type VotingRecordsData = {
  votes: ProjectVotesPayload | undefined;
};
