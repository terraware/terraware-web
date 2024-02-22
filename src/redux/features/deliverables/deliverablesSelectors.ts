import { RootState } from 'src/redux/rootReducer';

export const selectDeliverableList = (organizationId: number) => (state: RootState) =>
  state.deliverableList[organizationId];

export const selectDeliverable = (deliverableId: number) => (state: RootState) => state.deliverables[deliverableId];
