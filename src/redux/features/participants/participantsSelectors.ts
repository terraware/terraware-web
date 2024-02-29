import { RootState } from 'src/redux/rootReducer';

export const selectParticipantsListRequest = (requestId: string) => (state: RootState) =>
  state.participantsList[requestId];
