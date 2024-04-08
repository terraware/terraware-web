import { RootState } from 'src/redux/rootReducer';

export const selectParticipantCreateRequest = (requestId: string) => (state: RootState) =>
  state.participantCreate[requestId];

export const selectParticipantDeleteRequest = (requestId: string) => (state: RootState) =>
  state.participantDelete[requestId];

export const selectParticipant = (participantId: number) => (state: RootState) => state.participant[participantId].data;

export const selectParticipantGetRequest = (requestId: string) => (state: RootState) => state.participant[requestId];

export const selectParticipantListRequest = (requestId: string) => (state: RootState) =>
  state.participantList[requestId];

export const selectParticipantUpdateRequest = (requestId: string) => (state: RootState) =>
  state.participantUpdate[requestId];
