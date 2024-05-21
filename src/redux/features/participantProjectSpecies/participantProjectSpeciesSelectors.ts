import { RootState } from 'src/redux/rootReducer';

export const selectParticipantProjectSpecies = (participantProjectSpeciesId: number) => (state: RootState) =>
  state.participantProjectSpeciesGet[participantProjectSpeciesId]?.data;

export const selectParticipantProjectSpeciesAssignRequest = (requestId: string) => (state: RootState) =>
  state.participantProjectSpeciesAssign[requestId];

export const selectParticipantProjectSpeciesCreateRequest = (requestId: string) => (state: RootState) =>
  state.participantProjectSpeciesCreate[requestId];

export const selectParticipantProjectSpeciesGetRequest = (requestId: string) => (state: RootState) =>
  state.participantProjectSpeciesGet[requestId];

export const selectParticipantProjectSpeciesListRequest = (projectId: number) => (state: RootState) =>
  state.participantProjectSpeciesList[projectId];

export const selectParticipantProjectSpeciesDeleteManyRequest = (requestId: string) => (state: RootState) =>
  state.participantProjectSpeciesDeleteMany[requestId];

export const selectParticipantProjectSpeciesUpdateRequest = (requestId: string) => (state: RootState) =>
  state.participantProjectSpeciesUpdate[requestId];

export const selectProjectsForSpeciesRequest = (requestId: string) => (state: RootState) =>
  state.participantProjectsForSpeciesGet[requestId];
