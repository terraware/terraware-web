import { RootState } from 'src/redux/rootReducer';

export const selectParticipantProjectRequest = (participantProjectId: number) => (state: RootState) =>
  state.participantProject[participantProjectId];
