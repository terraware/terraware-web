import { RootState } from 'src/redux/rootReducer';

export const selectProjectVotes = (state: RootState) => state.votes.votes;

export const selectProjectVotesRequest = (state: RootState, requestId: string) => state.votesRequests[requestId];
