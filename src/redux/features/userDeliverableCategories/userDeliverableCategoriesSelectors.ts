import { RootState } from 'src/redux/rootReducer';

export const selectUserDeliverableCategoriesGetRequest = (requestId: string) => (state: RootState) =>
  state.userDeliverableCategoriesGet[requestId];

export const selectUserDeliverableCategoriesUpdateRequest = (requestId: string) => (state: RootState) =>
  state.userDeliverableCategoriesUpdate[requestId];
