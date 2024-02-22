import { RootState } from 'src/redux/rootReducer';

export const selectDeliverableList = (organizationId: number, speciesId?: number) => (state: RootState) =>
  state.deliverableList[organizationId];
