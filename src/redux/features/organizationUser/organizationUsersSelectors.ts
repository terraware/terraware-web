import { RootState } from 'src/redux/rootReducer';

export const selectOrganizationUsers = (requestId: string) => (state: RootState) =>
  state.organizationUsersList[requestId];
