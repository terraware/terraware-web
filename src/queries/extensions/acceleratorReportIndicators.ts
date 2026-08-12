import { api } from '../generated/acceleratorReportIndicators';
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
        { type: QueryTagTypes.ProjectAcceleratorReport, id: args.projectId },
        { type: QueryTagTypes.PublishedAcceleratorReport },
      ],
    },
    updateProjectIndicator: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.ProjectIndicators, id: payload.indicatorId },
        { type: QueryTagTypes.ProjectAcceleratorReport, id: payload.projectId },
        { type: QueryTagTypes.PublishedAcceleratorReport },
      ],
    },
    listCommonIndicators: {
      providesTags: (results) => [
        ...(results?.indicators.map((indicator) => ({ type: QueryTagTypes.CommonIndicators, id: indicator.id })) ?? []),
        { type: QueryTagTypes.CommonIndicators, id: 'LIST' },
      ],
    },
    // Common indicators are shared, so every project's reports are stale.
    createCommonIndicator: {
      invalidatesTags: () => [
        { type: QueryTagTypes.CommonIndicators, id: 'LIST' },
        { type: QueryTagTypes.AcceleratorReport },
        { type: QueryTagTypes.ProjectAcceleratorReport },
        { type: QueryTagTypes.PublishedAcceleratorReport },
      ],
    },
    updateCommonIndicator: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.CommonIndicators, id: payload.indicatorId },
        { type: QueryTagTypes.AcceleratorReport },
        { type: QueryTagTypes.ProjectAcceleratorReport },
        { type: QueryTagTypes.PublishedAcceleratorReport },
      ],
    },
  },
});
