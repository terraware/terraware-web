import { RootState } from 'src/redux/rootReducer';

export const selectFundingEntitiesRequest = (requestId: string) => (state: RootState) =>
  state.fundingEntitiesList[requestId];

export const selectFundingEntityRequest = (fundingEntityId?: number) => (state: RootState) =>
  state.fundingEntityGet[fundingEntityId || -1];

export const selectUserFundingEntityRequest = (userId?: number) => (state: RootState) =>
  state.fundingEntityForUser[userId || -1];

export const selectFundingEntityUpdateRequest = (requestId: string) => (state: RootState) =>
  state.fundingEntityUpdate[requestId];

export const selectFundingEntityCreateRequest = (requestId: string) => (state: RootState) =>
  state.fundingEntityCreate[requestId];

export const selectListFundersRequest = (requestId: string) => (state: RootState) =>
  state.fundingEntityGetFunders[requestId];

export const selectDeleteFundersRequest = (requestId: string) => (state: RootState) =>
  state.fundingEntityDeleteFunders[requestId];

export const selectFundingEntityFunders = (fundingEntityId?: number) => (state: RootState) =>
  state.fundingEntityGetFunders[fundingEntityId || -1];

export const inviteFunderRequest = (requestId: string) => (state: RootState) => state.fundingEntityInvite[requestId];

export const selectProjectFundingEntities = (requestId: string) => (state: RootState) =>
  state.projectFundingEntities[requestId];
