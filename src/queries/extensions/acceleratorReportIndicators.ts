import { api } from '../generated/acceleratorReportIndicators';
import { QueryTagTypes, projectAcceleratorReportTag } from '../tags';

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
        projectAcceleratorReportTag(args.projectId),
      ],
    },
    updateProjectIndicator: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.ProjectIndicators, id: payload.indicatorId },
        projectAcceleratorReportTag(payload.projectId),
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
        { type: QueryTagTypes.AcceleratorReport },
      ],
    },
    updateCommonIndicator: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.CommonIndicators, id: payload.indicatorId },
        { type: QueryTagTypes.AcceleratorReport },
      ],
    },
  },
});
