import { RootState } from 'src/redux/rootReducer';

export const selectPlantingSiteCreate = (requestId: string) => (state: RootState) =>
  state.plantingSiteCreate[requestId];
export const selectPlantingSiteValidate = (requestId: string) => (state: RootState) =>
  state.plantingSiteValidate[requestId];
export const selectPlantingSiteUpdate = (requestId: string) => (state: RootState) =>
  state.plantingSiteUpdate[requestId];
export const selectPlantingSiteDelete = (requestId: string) => (state: RootState) =>
  state.plantingSiteDelete[requestId];
