import { RootState } from 'src/redux/rootReducer';

export const selectDeliverablesSearchRequest = (requestId: string) => (state: RootState) =>
  state.deliverablesSearch[requestId];

export const selectDeliverable = (deliverableId: number) => (state: RootState) =>
  (state.deliverables[deliverableId] || {}).data;

export const selectDeliverableFetchRequest = (deliverableId: number) => (state: RootState) =>
  state.deliverables[deliverableId];
