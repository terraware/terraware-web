import { RootState } from 'src/redux/rootReducer';

export const selectParticipantGetRequest = (requestId: string) => (state: RootState) => state.participant[requestId];
