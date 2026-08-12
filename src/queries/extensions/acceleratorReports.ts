import { AcceleratorReportPayload, api } from '../generated/acceleratorReports';
import { QueryTagTypes } from '../tags';

/**
 * Reports are tagged at three scopes so mutations can invalidate exactly as much as they change:
 *  - `AcceleratorReport` / report id: one report.
 *  - `ProjectAcceleratorReport` / project id: every report of a project.
 *  - `ProjectAcceleratorReportYear` / `${projectId}-${year}`: every report of a project in one year.
 *
 * Every report query provides all three, so a mutation picks the scope and any mounted query holding
 * that scope refetches.
 */
const reportTag = (reportId: number) => ({ type: QueryTagTypes.AcceleratorReport, id: reportId });

const projectReportsTag = (projectId: number) => ({ type: QueryTagTypes.ProjectAcceleratorReport, id: projectId });

const projectReportYearTag = (projectId: number, year: number) => ({
  type: QueryTagTypes.ProjectAcceleratorReportYear,
  id: `${projectId}-${year}`,
});

const reportConfigsTag = (projectId: number) => ({
  type: QueryTagTypes.ProjectAcceleratorReportConfigs,
  id: projectId,
});

/**
 * The target endpoints return every yearly target of a project in one payload, so project id is the
 * only granularity available here even for a mutation that touches a single year.
 */
const reportTargetsTag = (projectId: number) => ({
  type: QueryTagTypes.ProjectAcceleratorReportTargets,
  id: projectId,
});

const reportMediaTag = (fileId: number) => ({ type: QueryTagTypes.AcceleratorReportMedia, id: fileId });

const reportYear = (report: AcceleratorReportPayload) => Number(report.startDate.split('-')[0]);

api.enhanceEndpoints({
  endpoints: {
    listAcceleratorReports: {
      providesTags: (results, _error, args) => {
        const years = new Set<number>(args.year === undefined ? [] : [args.year]);
        results?.reports.forEach((report) => years.add(reportYear(report)));

        return [
          ...(results?.reports.map((report) => reportTag(report.id)) ?? []),
          projectReportsTag(args.projectId),
          ...[...years].map((year) => projectReportYearTag(args.projectId, year)),
        ];
      },
    },
    getAcceleratorReport: {
      providesTags: (results, _error, args) => [
        reportTag(args.reportId),
        projectReportsTag(args.projectId),
        ...(results ? [projectReportYearTag(args.projectId, reportYear(results.report))] : []),
      ],
    },
    getOneAcceleratorReport: {
      providesTags: (results, _error, args) => [
        reportTag(args.reportId),
        ...(results
          ? [
              projectReportsTag(results.report.projectId),
              projectReportYearTag(results.report.projectId, reportYear(results.report)),
            ]
          : []),
      ],
    },

    listAcceleratorReportConfig: {
      providesTags: (_results, _error, projectId) => [reportConfigsTag(projectId)],
    },
    getAcceleratorReportYears: {
      providesTags: (_results, _error, projectId) => [reportConfigsTag(projectId)],
    },

    // A config change shifts the reporting period, so every report of the project is stale.
    createAcceleratorReportConfig: {
      invalidatesTags: (_results, _error, args) => [
        reportConfigsTag(args.projectId),
        projectReportsTag(args.projectId),
      ],
    },
    updateAcceleratorReportConfig: {
      invalidatesTags: (_results, _error, args) => [
        reportConfigsTag(args.projectId),
        projectReportsTag(args.projectId),
      ],
    },
    updateProjectAcceleratorReportConfig: {
      invalidatesTags: (_results, _error, args) => [
        reportConfigsTag(args.projectId),
        projectReportsTag(args.projectId),
      ],
    },

    getAutoCalculatedIndicatorTargets: {
      providesTags: (_results, _error, projectId) => [reportTargetsTag(projectId)],
    },
    getCommonIndicatorTargets: {
      providesTags: (_results, _error, projectId) => [reportTargetsTag(projectId)],
    },
    getProjectIndicatorTargets: {
      providesTags: (_results, _error, projectId) => [reportTargetsTag(projectId)],
    },

    // A yearly target only appears on that year's reports.
    updateAutoCalculatedIndicatorTarget: {
      invalidatesTags: (_results, _error, args) => [
        reportTargetsTag(args.projectId),
        projectReportYearTag(args.projectId, args.updateAutoCalculatedIndicatorTargetRequestPayload.year),
      ],
    },
    updateCommonIndicatorTarget: {
      invalidatesTags: (_results, _error, args) => [
        reportTargetsTag(args.projectId),
        projectReportYearTag(args.projectId, args.updateCommonIndicatorTargetRequestPayload.year),
      ],
    },
    updateProjectIndicatorTarget: {
      invalidatesTags: (_results, _error, args) => [
        reportTargetsTag(args.projectId),
        projectReportYearTag(args.projectId, args.updateProjectIndicatorTargetRequestPayload.year),
      ],
    },

    // Baselines and end-of-project targets appear on every report of the project.
    updateAutoCalculatedIndicatorBaselineTarget: {
      invalidatesTags: (_results, _error, args) => [
        reportTargetsTag(args.projectId),
        projectReportsTag(args.projectId),
      ],
    },
    updateCommonIndicatorBaselineTarget: {
      invalidatesTags: (_results, _error, args) => [
        reportTargetsTag(args.projectId),
        projectReportsTag(args.projectId),
      ],
    },
    updateProjectIndicatorBaselineTarget: {
      invalidatesTags: (_results, _error, args) => [
        reportTargetsTag(args.projectId),
        projectReportsTag(args.projectId),
      ],
    },

    updateAcceleratorReportValues: {
      invalidatesTags: (_results, _error, args) => [reportTag(args.reportId)],
    },
    updateOneAcceleratorReportValues: {
      invalidatesTags: (_results, _error, args) => [reportTag(args.reportId)],
    },
    refreshAcceleratorReportAutoCalculatedIndicators: {
      invalidatesTags: (_results, _error, args) => [reportTag(args.reportId)],
    },
    refreshOneAcceleratorReportAutoCalculatedIndicators: {
      invalidatesTags: (_results, _error, args) => [reportTag(args.reportId)],
    },
    reviewAcceleratorReportIndicators: {
      invalidatesTags: (_results, _error, args) => [reportTag(args.reportId)],
    },
    reviewOneAcceleratorReportIndicators: {
      invalidatesTags: (_results, _error, args) => [reportTag(args.reportId)],
    },
    reviewAcceleratorReport: {
      invalidatesTags: (_results, _error, args) => [reportTag(args.reportId)],
    },
    reviewOneAcceleratorReport: {
      invalidatesTags: (_results, _error, args) => [reportTag(args.reportId)],
    },
    submitAcceleratorReport: {
      invalidatesTags: (_results, _error, args) => [reportTag(args.reportId)],
    },
    submitOneAcceleratorReport: {
      invalidatesTags: (_results, _error, reportId) => [reportTag(reportId)],
    },

    publishAcceleratorReport: {
      invalidatesTags: (_results, _error, args) => [
        reportTag(args.reportId),
        { type: QueryTagTypes.PublishedAcceleratorReport, id: args.reportId },
        { type: QueryTagTypes.PublishedAcceleratorReport, id: 'LIST' },
      ],
    },
    publishOneAcceleratorReport: {
      invalidatesTags: (_results, _error, reportId) => [
        reportTag(reportId),
        { type: QueryTagTypes.PublishedAcceleratorReport, id: reportId },
        { type: QueryTagTypes.PublishedAcceleratorReport, id: 'LIST' },
      ],
    },

    getAcceleratorReportPhoto: {
      providesTags: (_results, _error, args) => [reportMediaTag(args.fileId)],
    },
    getOneAcceleratorReportPhoto: {
      providesTags: (_results, _error, args) => [reportMediaTag(args.fileId)],
    },
    uploadAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [reportTag(args.reportId)],
    },
    uploadOneAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [reportTag(args.reportId)],
    },
    updateAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [reportTag(args.reportId), reportMediaTag(args.fileId)],
    },
    updateOneAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [reportTag(args.reportId), reportMediaTag(args.fileId)],
    },
    deleteAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [reportTag(args.reportId)],
    },
    deleteOneAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [reportTag(args.reportId)],
    },
  },
});
