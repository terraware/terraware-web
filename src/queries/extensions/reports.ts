import { api } from '../generated/reports';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listAcceleratorReports: {
      providesTags: (results, _error, args) => {
        const projectId = args.projectId;
        const reportTags =
          results?.reports.map((report) => ({
            type: QueryTagTypes.Reports,
            id: report.id,
          })) ?? [];

        return [
          ...reportTags,

          {
            type: QueryTagTypes.ProjectReportConfigs,
            id: projectId,
          },

          {
            type: QueryTagTypes.Reports,
            id: 'LIST',
          },
        ];
      },
    },
    listAcceleratorReportConfig: {
      providesTags: (_results, _error, projectId) => [
        {
          type: QueryTagTypes.ProjectReportConfigs,
          id: projectId,
        },
      ],
    },
    updateProjectAcceleratorReportConfig: {
      invalidatesTags: (_results, _error, args) => [
        {
          type: QueryTagTypes.ProjectReportConfigs,
          id: args.projectId,
        },
      ],
    },
    createAcceleratorReportConfig: {
      invalidatesTags: (_results, _error, args) => [
        {
          type: QueryTagTypes.ProjectReportConfigs,
          id: args.projectId,
        },
      ],
    },
    updateAcceleratorReportConfig: {
      invalidatesTags: (_results, _error, args) => [
        {
          type: QueryTagTypes.ProjectReportConfigs,
          id: args.projectId,
        },
      ],
    },
    listProjectMetrics: {
      providesTags: (_results, _error, projectId) => [
        {
          type: QueryTagTypes.ProjectMetrics,
          id: projectId,
        },
      ],
    },
    createProjectMetric: {
      invalidatesTags: (_results, _error, args) => [
        {
          type: QueryTagTypes.ProjectMetrics,
          id: args.projectId,
        },
        {
          type: QueryTagTypes.ProjectMetricTargets,
          id: args.projectId,
        },
      ],
    },
    updateProjectMetric: {
      invalidatesTags: (_results, _error, args) => [
        {
          type: QueryTagTypes.ProjectMetrics,
          id: args.projectId,
        },
      ],
    },
    getProjectMetricTargets: {
      providesTags: (_result, _error, projectId) => [
        {
          type: QueryTagTypes.ProjectMetricTargets,
          id: projectId,
        },
      ],
    },
    updateProjectMetricTarget: {
      invalidatesTags: (_result, _error, args) => [
        {
          type: QueryTagTypes.Reports,
        },
        {
          type: QueryTagTypes.ProjectMetricTargets,
          id: args.projectId,
        },
      ],
    },
    getStandardMetricTargets: {
      providesTags: (_result, _error, projectId) => [
        {
          type: QueryTagTypes.StandadMetricTargets,
          id: projectId,
        },
      ],
    },
    updateStandardMetricTarget: {
      invalidatesTags: (_result, _error, args) => [
        {
          type: QueryTagTypes.Reports,
        },
        {
          type: QueryTagTypes.StandadMetricTargets,
          id: args.projectId,
        },
      ],
    },
    getSystemMetricTargets: {
      providesTags: (_result, _error, projectId) => [
        {
          type: QueryTagTypes.SystemMetricTargets,
          id: projectId,
        },
      ],
    },
    updateSystemMetricTarget: {
      invalidatesTags: (_result, _error, args) => [
        {
          type: QueryTagTypes.Reports,
        },
        {
          type: QueryTagTypes.SystemMetricTargets,
          id: args.projectId,
        },
      ],
    },
    getAcceleratorReport: {
      providesTags: (_results, _error, args) => [
        {
          type: QueryTagTypes.Reports,
          id: args.reportId,
        },
        {
          type: QueryTagTypes.ProjectReportConfigs,
          id: args.projectId,
        },
      ],
    },
    updateAcceleratorReportValues: {
      invalidatesTags: (_results, _error, args) => [
        {
          type: QueryTagTypes.Reports,
          id: args.reportId,
        },
      ],
    },
    refreshAcceleratorReportSystemMetrics: {
      invalidatesTags: (_results, _error, args) => [
        {
          type: QueryTagTypes.Reports,
          id: args.reportId,
        },
      ],
    },
    reviewAcceleratorReportMetrics: {
      invalidatesTags: (_results, _error, args) => [
        {
          type: QueryTagTypes.Reports,
          id: args.reportId,
        },
      ],
    },
    uploadAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [
        {
          type: QueryTagTypes.Reports,
          id: args.reportId,
        },
      ],
    },
    deleteAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [
        {
          type: QueryTagTypes.Reports,
          id: args.reportId,
        },
        {
          type: QueryTagTypes.ReportMedia,
          id: args.fileId,
        },
      ],
    },
    getAcceleratorReportPhoto: {
      providesTags: (_results, _error, args) => [
        {
          type: QueryTagTypes.Reports,
          id: args.reportId,
        },
        {
          type: QueryTagTypes.ReportMedia,
          id: args.fileId,
        },
      ],
    },
    updateAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [
        {
          type: QueryTagTypes.Reports,
          id: args.reportId,
        },
        {
          type: QueryTagTypes.ReportMedia,
          id: args.fileId,
        },
      ],
    },
    publishAcceleratorReport: {
      invalidatesTags: (_results, _error, args) => [
        {
          type: QueryTagTypes.Reports,
          id: args.reportId,
        },
        {
          type: QueryTagTypes.PublishedReports,
          id: args.reportId,
        },
      ],
    },
    reviewAcceleratorReport: {
      invalidatesTags: (_results, _error, args) => [
        {
          type: QueryTagTypes.Reports,
          id: args.reportId,
        },
      ],
    },
    submitAcceleratorReport: {
      invalidatesTags: (_results, _error, args) => [
        {
          type: QueryTagTypes.Reports,
          id: args.reportId,
        },
      ],
    },
    getAcceleratorReportYears: {
      providesTags: (_results, _error, projectId) => [
        {
          type: QueryTagTypes.ProjectReportConfigs,
          id: projectId,
        },
      ],
    },
  },
});
