import { RootState } from 'src/redux/rootReducer';

export const selectUserInternalInterestsGetRequest = (userId: number) => (state: RootState) =>
  state.userInternalInterestsGet[userId];

export const selectUserInternalInterestsUpdateRequest = (requestId: string) => (state: RootState) =>
  state.userInternalInterestsUpdate[requestId];
