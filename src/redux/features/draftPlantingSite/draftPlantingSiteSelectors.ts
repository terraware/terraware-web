import { RootState } from 'src/redux/rootReducer';

export const selectDraftPlantingSiteCreate = (requestId: string) => (state: RootState) =>
  state.draftPlantingSiteCreate[requestId];
export const selectDraftPlantingSiteEdit = (requestId: string) => (state: RootState) =>
  state.draftPlantingSiteEdit[requestId];
export const selectDraftPlantingSiteGet = (id: number) => (state: RootState) => state.draftPlantingSiteGet[id];
