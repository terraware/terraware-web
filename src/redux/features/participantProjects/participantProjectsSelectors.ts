import { RootState } from 'src/redux/rootReducer';

export const selectParticipantProjectsListRequest = (requestId: string) => (state: RootState) =>
  state.participantProjectsList[requestId];
