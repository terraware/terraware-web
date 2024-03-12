export type VotingRecord = {
  field: string; // 'person 1', 'person 2', 'person 3'
  value: 'yes' | 'no' | 'conditional';
};

export type UserId = number;

export type ProjectId = number;

export type CohortPhase = string;

export type VoteOption = 'yes' | 'no' | 'conditional';

export type VoteSelection = {
  userId: UserId;
  voteOption: VoteOption;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export type CohortVotes = {
  cohortPhase: CohortPhase;
  votes: VoteSelection[];
};

export type ProjectVotesPayload = {
  projectId: ProjectId;
  phases: CohortVotes[];
};

export type GetProjectVotesResponsePayload = {
  votes: ProjectVotesPayload;
  status: 'ok' | 'error';
};

export type ListVotingRecordsRequestParams = {
  projectId: number;
};

export type EnterVotingRecordRequestPayload = {
  voter: string; // User name or ID or email
  vote: 'yes' | 'no' | 'conditional';
  comments: string | null;
};

export type EnterVotingRecordResponsePayload = {
  status: 'ok' | 'error';
};

export type VotingRecordsData = {
  votes: ProjectVotesPayload | undefined;
};
