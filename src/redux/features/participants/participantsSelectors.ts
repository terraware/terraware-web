import { RootState } from 'src/redux/rootReducer';

export const selectParticipant = (participantId: number) => (state: RootState) =>
  state.participant[participantId]?.data;

export const selectParticipantGetRequest = (requestId: string) => (state: RootState) => state.participant[requestId];

export const selectParticipantListRequest = (requestId: string) => (state: RootState) =>
  state.participantList[requestId];
