import { RootState } from 'src/redux/rootReducer';

export const selectProjectVotes = (state: RootState, projectId: number) => state.votes[projectId];

export const selectProjectVotesEditRequest = (state: RootState, requestId: string) => state.votesRequests[requestId];
