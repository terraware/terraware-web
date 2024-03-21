import { RootState } from 'src/redux/rootReducer';

export const selectParticipantProject = (participantProjectId: number) => (state: RootState) =>
  state.participantProject[participantProjectId].data;
