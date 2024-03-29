import { RootState } from 'src/redux/rootReducer';

export const selectGlobalRolesUsersSearchRequest = (requestId: string) => (state: RootState) =>
  state.globalRolesUsersList[requestId];

export const selectGlobalRolesUsersRemoveRequest = (requestId: string) => (state: RootState) =>
  state.globalRolesUsersRemove[requestId];

export const selectGlobalRolesUserUpdateRequest = (requestId: string) => (state: RootState) =>
  state.globalRolesUserUpdate[requestId];
