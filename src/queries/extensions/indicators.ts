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
      invalidatesTags: (_results, _error, args) => [
        { type: QueryTagTypes.ProjectIndicators, id: 'LIST' },
        { type: QueryTagTypes.Reports, id: `project-${args.projectId}` },
        { type: QueryTagTypes.PublishedReports },
      ],
    },
    updateProjectIndicator: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.ProjectIndicators, id: payload.indicatorId },
        { type: QueryTagTypes.Reports, id: `project-${payload.projectId}` },
        { type: QueryTagTypes.PublishedReports },
      ],
    },
    listCommonIndicators: {
      providesTags: (results) => [
        ...(results?.indicators.map((indicator) => ({ type: QueryTagTypes.CommonIndicators, id: indicator.id })) ?? []),
        { type: QueryTagTypes.CommonIndicators, id: 'LIST' },
      ],
    },
    createCommonIndicator: {
      invalidatesTags: () => [
        { type: QueryTagTypes.CommonIndicators, id: 'LIST' },
        { type: QueryTagTypes.Reports },
        { type: QueryTagTypes.PublishedReports },
      ],
    },
    updateCommonIndicator: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.CommonIndicators, id: payload.indicatorId },
        { type: QueryTagTypes.Reports },
        { type: QueryTagTypes.PublishedReports },
      ],
    },
  },
});
