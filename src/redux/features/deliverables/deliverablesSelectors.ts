import { RootState } from 'src/redux/rootReducer';

export const selectDeliverables = (organizationId: number, speciesId?: number) => (state: RootState) =>
  state.deliverables[organizationId];
