import { RootState } from 'src/redux/rootReducer';

import { deliverableCompositeKeyFn } from './deliverablesSlice';

export const selectDeliverablesSearchRequest = (requestId: string) => (state: RootState) =>
  state.deliverablesSearch[requestId];

export const selectDeliverableFetchRequest = (requestId: string) => (state: RootState) => state.deliverables[requestId];

export const selectDeliverableData = (deliverableId: number, projectId: number) => (state: RootState) =>
  state.deliverables[deliverableCompositeKeyFn({ deliverableId, projectId })]?.data;

export const selectDeliverablesEditRequest = (requestId: string) => (state: RootState) =>
  state.deliverablesEdit[requestId];
