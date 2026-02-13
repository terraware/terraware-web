import { RootState } from 'src/redux/rootReducer';

export const selectParticipantProjectUpdateRequest = (requestId: string) => (state: RootState) =>
  state.participantProjectUpdate[requestId];

export const selectParticipantProjectsListRequest = (requestId: string) => (state: RootState) =>
  state.participantProjectsList[requestId];
