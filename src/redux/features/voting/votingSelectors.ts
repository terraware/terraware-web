import { RootState } from 'src/redux/rootReducer';

export const selectProjectVotes = (state: RootState) => state.voting.votes;

export const selectProjectVotesRequest = (state: RootState, requestId: string) => state.votingRequests[requestId];
