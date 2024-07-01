import { RootState } from 'src/redux/rootReducer';

export const selectUserDeliverableCategoriesGetRequest = (userId: number) => (state: RootState) =>
  state.userDeliverableCategoriesGet[userId];

export const selectUserDeliverableCategoriesUpdateRequest = (requestId: string) => (state: RootState) =>
  state.userDeliverableCategoriesUpdate[requestId];
