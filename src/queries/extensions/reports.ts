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

          {
            type: QueryTagTypes.Reports,
            id: `project-${projectId}`,
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
    updateProjectIndicatorTarget: {
      invalidatesTags: (_result, _error, args) => [
        {
          type: QueryTagTypes.Reports,
          id: `project-${args.projectId}`,
        },
      ],
    },
    updateCommonIndicatorTarget: {
      invalidatesTags: (_result, _error, args) => [
        {
          type: QueryTagTypes.Reports,
          id: `project-${args.projectId}`,
        },
      ],
    },
    updateAutoCalculatedIndicatorTarget: {
      invalidatesTags: (_result, _error, args) => [
        {
          type: QueryTagTypes.Reports,
          id: `project-${args.projectId}`,
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
        {
          type: QueryTagTypes.Reports,
          id: `project-${args.projectId}`,
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
    reviewAcceleratorReportIndicators: {
      invalidatesTags: () => [
        {
          type: QueryTagTypes.Reports,
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
