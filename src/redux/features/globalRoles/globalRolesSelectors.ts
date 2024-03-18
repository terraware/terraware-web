import { RootState } from 'src/redux/rootReducer';

export const selectGlobalRolesUser = (userId: number) => (state: RootState) =>
  state.globalRolesUser[userId]?.data?.user;

export const selectGlobalRolesUsersSearchRequest = (requestId: string) => (state: RootState) =>
  state.globalRolesUsersList[requestId];

export const selectGlobalRolesUserUpdateRequest = (requestId: string) => (state: RootState) =>
  state.globalRolesUserUpdate[requestId];
