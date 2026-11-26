import { api } from '../generated/indicators';
import { QueryTagTypes, projectAcceleratorReportTag } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listCommonDefinitions: {
      providesTags: () => [{ type: QueryTagTypes.CommonIndicators, id: 'LIST' }],
    },
    createCommonDefinition: {
      invalidatesTags: () => [{ type: QueryTagTypes.CommonIndicators, id: 'LIST' }],
    },
    listProjectCommonIndicators: {
      providesTags: (_results, _error, projectId) => [
        { type: QueryTagTypes.CommonIndicators, id: projectId },
        { type: QueryTagTypes.CommonIndicators, id: 'LIST' },
      ],
    },
    updateProjectCommonIndicator: {
      invalidatesTags: (_results, _error, args) => [
        // Shared fields change for every project, so every project's list is stale.
        { type: QueryTagTypes.CommonIndicators, id: 'LIST' },
        { type: QueryTagTypes.AcceleratorReport },
        projectAcceleratorReportTag(args.projectId),
      ],
    },
    listProjectAutoCalculatedIndicators: {
      providesTags: (_results, _error, projectId) => [{ type: QueryTagTypes.AutoCalculatedIndicators, id: projectId }],
    },
    updateProjectAutoCalculatedIndicator: {
      invalidatesTags: (_results, _error, args) => [
        { type: QueryTagTypes.AutoCalculatedIndicators, id: args.projectId },
        { type: QueryTagTypes.AcceleratorReport },
        projectAcceleratorReportTag(args.projectId),
      ],
    },
    listProjectSpecificIndicators: {
      providesTags: (_results, _error, projectId) => [{ type: QueryTagTypes.ProjectIndicators, id: projectId }],
    },
    createProjectSpecificIndicator: {
      invalidatesTags: (_results, _error, args) => [
        { type: QueryTagTypes.ProjectIndicators, id: args.projectId },
        projectAcceleratorReportTag(args.projectId),
      ],
    },
    updateProjectSpecificIndicator: {
      invalidatesTags: (_results, _error, args) => [
        { type: QueryTagTypes.ProjectIndicators, id: args.projectId },
        projectAcceleratorReportTag(args.projectId),
      ],
    },
  },
});
