import { AcceleratorReportPayload, api } from '../generated/acceleratorReports';
import {
  QueryTagTypes,
  acceleratorReportMediaTag,
  acceleratorReportTag,
  projectAcceleratorReportConfigsTag,
  projectAcceleratorReportTag,
  projectAcceleratorReportTargetsTag,
  projectAcceleratorReportYearTag,
} from '../tags';

const reportYear = (report: AcceleratorReportPayload) => Number(report.startDate.split('-')[0]);

api.enhanceEndpoints({
  endpoints: {
    listAcceleratorReports: {
      providesTags: (results, _error, args) => {
        const years = new Set<number>(args.year === undefined ? [] : [args.year]);
        results?.reports.forEach((report) => years.add(reportYear(report)));

        return [
          ...(results?.reports.map((report) => acceleratorReportTag(report.id)) ?? []),
          projectAcceleratorReportTag(args.projectId),
          ...[...years].map((year) => projectAcceleratorReportYearTag(args.projectId, year)),
        ];
      },
    },
    getAcceleratorReport: {
      providesTags: (results, _error, args) => [
        acceleratorReportTag(args.reportId),
        projectAcceleratorReportTag(args.projectId),
        ...(results ? [projectAcceleratorReportYearTag(args.projectId, reportYear(results.report))] : []),
      ],
    },
    getOneAcceleratorReport: {
      providesTags: (results, _error, args) => [
        acceleratorReportTag(args.reportId),
        ...(results
          ? [
              projectAcceleratorReportTag(results.report.projectId),
              projectAcceleratorReportYearTag(results.report.projectId, reportYear(results.report)),
            ]
          : []),
      ],
    },

    listAcceleratorReportConfig: {
      providesTags: (_results, _error, projectId) => [projectAcceleratorReportConfigsTag(projectId)],
    },
    getAcceleratorReportYears: {
      providesTags: (_results, _error, projectId) => [projectAcceleratorReportConfigsTag(projectId)],
    },
    createAcceleratorReportConfig: {
      invalidatesTags: (_results, _error, args) => [
        projectAcceleratorReportConfigsTag(args.projectId),
        projectAcceleratorReportTag(args.projectId),
      ],
    },
    updateAcceleratorReportConfig: {
      invalidatesTags: (_results, _error, args) => [
        projectAcceleratorReportConfigsTag(args.projectId),
        projectAcceleratorReportTag(args.projectId),
      ],
    },
    updateProjectAcceleratorReportConfig: {
      invalidatesTags: (_results, _error, args) => [
        projectAcceleratorReportConfigsTag(args.projectId),
        projectAcceleratorReportTag(args.projectId),
      ],
    },

    getAutoCalculatedIndicatorTargets: {
      providesTags: (_results, _error, projectId) => [projectAcceleratorReportTargetsTag(projectId)],
    },
    getCommonIndicatorTargets: {
      providesTags: (_results, _error, projectId) => [projectAcceleratorReportTargetsTag(projectId)],
    },
    getProjectIndicatorTargets: {
      providesTags: (_results, _error, projectId) => [projectAcceleratorReportTargetsTag(projectId)],
    },
    updateAutoCalculatedIndicatorTarget: {
      invalidatesTags: (_results, _error, args) => [
        projectAcceleratorReportTargetsTag(args.projectId),
        projectAcceleratorReportYearTag(args.projectId, args.updateAutoCalculatedIndicatorTargetRequestPayload.year),
      ],
    },
    updateCommonIndicatorTarget: {
      invalidatesTags: (_results, _error, args) => [
        projectAcceleratorReportTargetsTag(args.projectId),
        projectAcceleratorReportYearTag(args.projectId, args.updateCommonIndicatorTargetRequestPayload.year),
      ],
    },
    updateProjectIndicatorTarget: {
      invalidatesTags: (_results, _error, args) => [
        projectAcceleratorReportTargetsTag(args.projectId),
        projectAcceleratorReportYearTag(args.projectId, args.updateProjectIndicatorTargetRequestPayload.year),
      ],
    },
    updateAutoCalculatedIndicatorBaselineTarget: {
      invalidatesTags: (_results, _error, args) => [
        projectAcceleratorReportTargetsTag(args.projectId),
        projectAcceleratorReportTag(args.projectId),
      ],
    },
    updateCommonIndicatorBaselineTarget: {
      invalidatesTags: (_results, _error, args) => [
        projectAcceleratorReportTargetsTag(args.projectId),
        projectAcceleratorReportTag(args.projectId),
      ],
    },
    updateProjectIndicatorBaselineTarget: {
      invalidatesTags: (_results, _error, args) => [
        projectAcceleratorReportTargetsTag(args.projectId),
        projectAcceleratorReportTag(args.projectId),
      ],
    },

    updateAcceleratorReportValues: {
      invalidatesTags: (_results, _error, args) => [acceleratorReportTag(args.reportId)],
    },
    updateOneAcceleratorReportValues: {
      invalidatesTags: (_results, _error, args) => [acceleratorReportTag(args.reportId)],
    },
    refreshAcceleratorReportAutoCalculatedIndicators: {
      invalidatesTags: (_results, _error, args) => [acceleratorReportTag(args.reportId)],
    },
    refreshOneAcceleratorReportAutoCalculatedIndicators: {
      invalidatesTags: (_results, _error, args) => [acceleratorReportTag(args.reportId)],
    },
    reviewAcceleratorReportIndicators: {
      invalidatesTags: (_results, _error, args) => [acceleratorReportTag(args.reportId)],
    },
    reviewOneAcceleratorReportIndicators: {
      invalidatesTags: (_results, _error, args) => [acceleratorReportTag(args.reportId)],
    },
    reviewAcceleratorReport: {
      invalidatesTags: (_results, _error, args) => [acceleratorReportTag(args.reportId)],
    },
    reviewOneAcceleratorReport: {
      invalidatesTags: (_results, _error, args) => [acceleratorReportTag(args.reportId)],
    },
    submitAcceleratorReport: {
      invalidatesTags: (_results, _error, args) => [acceleratorReportTag(args.reportId)],
    },
    submitOneAcceleratorReport: {
      invalidatesTags: (_results, _error, reportId) => [acceleratorReportTag(reportId)],
    },

    publishAcceleratorReport: {
      invalidatesTags: (_results, _error, args) => [
        acceleratorReportTag(args.reportId),
        { type: QueryTagTypes.PublishedAcceleratorReport, id: args.reportId },
        { type: QueryTagTypes.PublishedAcceleratorReport, id: 'LIST' },
      ],
    },
    publishOneAcceleratorReport: {
      invalidatesTags: (_results, _error, reportId) => [
        acceleratorReportTag(reportId),
        { type: QueryTagTypes.PublishedAcceleratorReport, id: reportId },
        { type: QueryTagTypes.PublishedAcceleratorReport, id: 'LIST' },
      ],
    },

    getAcceleratorReportPhoto: {
      providesTags: (_results, _error, args) => [acceleratorReportMediaTag(args.fileId)],
    },
    getOneAcceleratorReportPhoto: {
      providesTags: (_results, _error, args) => [acceleratorReportMediaTag(args.fileId)],
    },
    uploadAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [acceleratorReportTag(args.reportId)],
    },
    uploadOneAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [acceleratorReportTag(args.reportId)],
    },
    updateAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [
        acceleratorReportTag(args.reportId),
        acceleratorReportMediaTag(args.fileId),
      ],
    },
    updateOneAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [
        acceleratorReportTag(args.reportId),
        acceleratorReportMediaTag(args.fileId),
      ],
    },
    deleteAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [acceleratorReportTag(args.reportId)],
    },
    deleteOneAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [acceleratorReportTag(args.reportId)],
    },
  },
});
