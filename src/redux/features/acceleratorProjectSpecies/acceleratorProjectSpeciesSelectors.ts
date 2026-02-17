import { RootState } from 'src/redux/rootReducer';

export const selectAcceleratorProjectSpeciesCreateRequest = (requestId: string) => (state: RootState) =>
  state.acceleratorProjectSpeciesCreate[requestId];

export const selectAcceleratorProjectSpeciesGetRequest = (requestId: string) => (state: RootState) =>
  state.acceleratorProjectSpeciesGet[requestId];

export const selectAcceleratorProjectSpeciesListRequest = (projectId: number) => (state: RootState) =>
  state.acceleratorProjectSpeciesList[projectId];

export const selectAcceleratorProjectSpeciesDeleteManyRequest = (requestId: string) => (state: RootState) =>
  state.acceleratorProjectSpeciesDeleteMany[requestId];

export const selectAcceleratorProjectSpeciesAddManyRequest = (requestId: string) => (state: RootState) =>
  state.acceleratorProjectSpeciesAddMany[requestId];

export const selectAcceleratorProjectSpeciesUpdateRequest = (requestId: string) => (state: RootState) =>
  state.acceleratorProjectSpeciesUpdate[requestId];

export const selectProjectsForSpeciesRequest = (requestId: string) => (state: RootState) =>
  state.acceleratorProjectsForSpeciesGet[requestId];
