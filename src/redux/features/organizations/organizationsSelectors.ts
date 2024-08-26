import { RootState } from 'src/redux/rootReducer';

export const listOrganizationInternalTags = (requestId: string) => (state: RootState) => state.internalTags[requestId];

export const selectUpdateOrganizationInternalTags = (requestId: string) => (state: RootState) =>
  state.internalTagsUpdate[requestId];

export const selectAddAcceleratorOrganization = (requestId: string) => (state: RootState) =>
  state.addAcceleratorOrganization[requestId];

export const selectRemoveAcceleratorOrganizations = (requestId: string) => (state: RootState) =>
  state.removeAcceleratorOrganizations[requestId];

export const listAllOrganizationsInternalTags = (requestId: string) => (state: RootState) =>
  state.listAllOrganizationsInternalTags[requestId];
