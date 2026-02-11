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
      providesTags: [
        {
          type: QueryTagTypes.ProjectMetricTargets,
        },
      ],
    },
    updateProjectMetricTarget: {
      invalidatesTags: [
        {
          type: QueryTagTypes.Reports,
        },
        {
          type: QueryTagTypes.ProjectMetricTargets,
        },
      ],
    },
    getStandardMetricTargets: {
      providesTags: [
        {
          type: QueryTagTypes.StandadMetricTargets,
        },
      ],
    },
    updateStandardMetricTarget: {
      invalidatesTags: [
        {
          type: QueryTagTypes.Reports,
        },
        {
          type: QueryTagTypes.StandadMetricTargets,
        },
      ],
    },
    getSystemMetricTargets: {
      providesTags: [
        {
          type: QueryTagTypes.SystemMetricTargets,
        },
      ],
    },
    updateSystemMetricTarget: {
      invalidatesTags: [
        {
          type: QueryTagTypes.Reports,
        },
        {
          type: QueryTagTypes.SystemMetricTargets,
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
