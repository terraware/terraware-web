export type VotingRecord = {
  field: string; // 'person 1', 'person 2', 'person 3'
  value: 'yes' | 'no' | 'conditional';
};

export type ListVotingRecordsResponsePayload = {
  votes: VotingRecord[];
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
  votes: VotingRecord[] | undefined;
};
