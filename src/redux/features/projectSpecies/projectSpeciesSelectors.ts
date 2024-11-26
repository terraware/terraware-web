import { RootState } from 'src/redux/rootReducer';

export const selectSpeciesDeliverables = (requestId: string) => (state: RootState) =>
  state.speciesDeliverables[requestId];
