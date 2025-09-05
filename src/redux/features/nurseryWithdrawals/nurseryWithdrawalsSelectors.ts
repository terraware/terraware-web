import { RootState } from 'src/redux/rootReducer';

export const selectPlantingSiteWithdrawnSpecies = (requestId: string) => (state: RootState) =>
  state.plantingSiteWithdrawnSpecies[requestId];
