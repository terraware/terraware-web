import { RootState } from 'src/redux/rootReducer';

import { participantProjectSpeciesCompositeKeyFn } from './participantProjectSpeciesSlice';

export const selectParticipantProjectSpeciesRequest = (requestId: string) => (state: RootState) =>
  state.participantProjectSpecies[requestId];

export const selectParticipantProjectSpeciesListRequest = (requestId: string) => (state: RootState) =>
  state.participantProjectSpeciesList[requestId];

export const selectParticipantProjectSpeciesUpdateRequest = (requestId: string) => (state: RootState) =>
  state.participantProjectSpeciesUpdate[requestId];

export const selectParticipantProjectSpeciesRemoveRequest = (requestId: string) => (state: RootState) =>
  state.participantProjectSpeciesRemove[requestId];

export const selectParticipantProjectSpecies =
  (projectId: number, participantProjectSpeciesId: number) => (state: RootState) =>
    state.participantProjectSpecies[participantProjectSpeciesCompositeKeyFn({ projectId, participantProjectSpeciesId })]
      ?.data;
