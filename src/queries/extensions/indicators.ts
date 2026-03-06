import { api } from '../generated/indicators';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listProjectIndicators: {
      providesTags: (results) => [
        ...(results?.indicators.map((indicator) => ({ type: QueryTagTypes.ProjectIndicators, id: indicator.id })) ??
          []),
        { type: QueryTagTypes.ProjectIndicators, id: 'LIST' },
      ],
    },
    createProjectIndicator: {
      invalidatesTags: () => [{ type: QueryTagTypes.ProjectIndicators, id: 'LIST' }],
    },
    updateProjectIndicator: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.ProjectIndicators, id: payload.indicatorId },
      ],
    },
    listCommonIndicators: {
      providesTags: (results) => [
        ...(results?.indicators.map((indicator) => ({ type: QueryTagTypes.CommonIndicators, id: indicator.id })) ?? []),
        { type: QueryTagTypes.CommonIndicators, id: 'LIST' },
      ],
    },
    createCommonIndicator: {
      invalidatesTags: () => [{ type: QueryTagTypes.CommonIndicators, id: 'LIST' }],
    },
    updateCommonIndicator: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.CommonIndicators, id: payload.indicatorId },
      ],
    },
  },
});
