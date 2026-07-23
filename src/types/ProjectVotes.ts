import { PhaseVotes, UpsertVoteSelection, VoteSelection } from 'src/queries/generated/projectVotes';

export type VoteOption = 'Yes' | 'No' | 'Conditional';

export type Phase = PhaseVotes['phase'];

export type { PhaseVotes, UpsertVoteSelection, VoteSelection };
