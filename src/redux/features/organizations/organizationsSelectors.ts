import { RootState } from 'src/redux/rootReducer';

export const listOrganizationInternalTags = (requestId: string) => (state: RootState) => state.internalTags[requestId];

export const selectUpdateOrganizationInternalTags = (requestId: string) => (state: RootState) =>
  state.internalTagsUpdate[requestId];
