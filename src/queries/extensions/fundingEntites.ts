import { api } from '../generated/fundingEntities';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listFundingEntities: {
      providesTags: (results) => [
        ...(results
          ? results.fundingEntities.map((entity) => ({ type: QueryTagTypes.FundingEntities, id: entity.id }))
          : []),
        { type: QueryTagTypes.FundingEntities, id: 'LIST' },
      ],
    },
    createFundingEntity: {
      invalidatesTags: (result) => [
        ...(result ? [{ type: QueryTagTypes.FundingEntities, id: result.fundingEntity.id }] : []),
        { type: QueryTagTypes.FundingEntities, id: 'LIST' },
      ],
    },
    getFundingEntity1: {
      providesTags: (result) => (result ? [{ type: QueryTagTypes.FundingEntities, id: result.fundingEntity.id }] : []),
    },
    deleteFundingEntity: {
      invalidatesTags: (_result, _error, fundingEntityId) => [
        { type: QueryTagTypes.FundingEntities, id: fundingEntityId },
        { type: QueryTagTypes.FundingEntities, id: 'LIST' },
      ],
    },
    getFundingEntity: {
      providesTags: (result) => (result ? [{ type: QueryTagTypes.FundingEntities, id: result.fundingEntity.id }] : []),
    },
    updateFundingEntity: {
      invalidatesTags: (_result, _error, payload) => [
        { type: QueryTagTypes.FundingEntities, id: payload.fundingEntityId },
        { type: QueryTagTypes.FundingEntities, id: 'LIST' },
      ],
    },
    removeFunder: {
      invalidatesTags: (_result, _error, payload) => [{ type: QueryTagTypes.Funders, id: payload.fundingEntityId }],
    },
    getFunders: {
      providesTags: (_result, _error, fundingEntityId) => [{ type: QueryTagTypes.Funders, id: fundingEntityId }],
    },
    inviteFunder: {
      invalidatesTags: (_result, _error, payload) => [{ type: QueryTagTypes.Funders, id: payload.fundingEntityId }],
    },
  },
});
