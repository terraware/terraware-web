import { RootState } from 'src/redux/rootReducer';

export const selectFundingEntitiesRequest = (requestId: string) => (state: RootState) =>
  state.fundingEntities[requestId];

export const selectFundingEntityRequest = (fundingEntityId?: number) => (state: RootState) =>
  state.fundingEntity[fundingEntityId || -1];

export const selectUserFundingEntityRequest = (userId?: number) => (state: RootState) =>
  state.userFundingEntity[userId || -1];

export const selectFundingEntityUpdateRequest = (requestId: string) => (state: RootState) =>
  state.fundingEntityUpdate[requestId];

export const selectFundingEntityCreateRequest = (requestId: string) => (state: RootState) =>
  state.fundingEntityCreate[requestId];

export const selectListFundersRequest = (requestId: string) => (state: RootState) => state.funders[requestId];

export const selectDeleteFundersRequest = (requestId: string) => (state: RootState) => state.deleteFunders[requestId];

export const selectFundingEntityFunders = (fundingEntityId?: number) => (state: RootState) =>
  state.funders[fundingEntityId || -1];

export const inviteFunderRequest = (requestId: string) => (state: RootState) => state.fundingEntityInvite[requestId];
