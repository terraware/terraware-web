import { RootState } from 'src/redux/rootReducer';

export const selectParticipantDeleteRequest = (requestId: string) => (state: RootState) =>
  state.participantDelete[requestId];

export const selectParticipant = (participantId: number) => (state: RootState) =>
  state.participant[participantId].data?.participant;

export const selectParticipantListRequest = (requestId: string) => (state: RootState) =>
  state.participantList[requestId];

export const selectParticipantUpdateRequest = (requestId: string) => (state: RootState) =>
  state.participantUpdate[requestId];
