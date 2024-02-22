import { RootState } from 'src/redux/rootReducer';

export const selectDeliverableList = (organizationId: number) => (state: RootState) =>
  state.deliverableList[organizationId];
