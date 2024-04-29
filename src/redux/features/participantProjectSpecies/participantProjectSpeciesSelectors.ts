import { RootState } from 'src/redux/rootReducer';

import { participantProjectSpeciesCompositeKeyFn } from './participantProjectSpeciesSlice';

export const selectParticipantProjectSpeciesRequest = (requestId: string) => (state: RootState) =>
  state.participantProjectSpecies[requestId];

export const selectParticipantProjectSpeciesListRequest = (projectId: number) => (state: RootState) =>
  state.participantProjectSpeciesList[projectId];

export const selectParticipantProjectSpeciesUpdateRequest = (requestId: string) => (state: RootState) =>
  state.participantProjectSpeciesUpdate[requestId];

export const selectParticipantProjectSpeciesRemoveRequest = (requestId: string) => (state: RootState) =>
  state.participantProjectSpeciesRemove[requestId];

export const selectParticipantProjectSpecies =
  (projectId: number, participantProjectSpeciesId: number) => (state: RootState) =>
    state.participantProjectSpecies[participantProjectSpeciesCompositeKeyFn({ projectId, participantProjectSpeciesId })]
      ?.data;
