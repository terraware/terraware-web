import { RootState } from 'src/redux/rootReducer';

export const selectDraftPlantingSiteCreate = (requestId: string) => (state: RootState) =>
  state.draftPlantingSiteCreate[requestId];
export const selectDraftPlantingSiteEdit = (requestId: string) => (state: RootState) =>
  state.draftPlantingSiteEdit[requestId];
export const selectDraftPlantingSiteGet = (id: number) => (state: RootState) => state.draftPlantingSiteGet[id];
export const selectDraftPlantingSite = (state: RootState, id: number) => selectDraftPlantingSiteGet(id)(state)?.data;

/**
 * Returns PlantingSiteSearchResult[], not a draft planting site will full geometries
 */
export const selectDraftPlantingSites = (organizationId: number) => (state: RootState) =>
  state.draftPlantingSiteSearch[organizationId];
