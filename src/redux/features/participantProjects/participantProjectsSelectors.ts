import { RootState } from 'src/redux/rootReducer';

export const selectParticipantProjectRequest = (participantProjectId: number) => (state: RootState) =>
  state.participantProject[participantProjectId];

export const selectParticipantProjectUpdateRequest = (requestId: string) => (state: RootState) =>
  state.participantProjectUpdate[requestId];
