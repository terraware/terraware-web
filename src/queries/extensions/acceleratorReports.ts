import { api } from '../generated/acceleratorReports';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getOneAcceleratorReport: {
      providesTags: (_results, _error, args) => [{ type: QueryTagTypes.Reports, id: args.reportId }],
    },
    updateOneAcceleratorReportValues: {
      invalidatesTags: (_results, _error, args) => [{ type: QueryTagTypes.Reports, id: args.reportId }],
    },
    refreshOneAcceleratorReportAutoCalculatedIndicators: {
      invalidatesTags: (_results, _error, args) => [{ type: QueryTagTypes.Reports, id: args.reportId }],
    },
    reviewOneAcceleratorReportIndicators: {
      invalidatesTags: (_results, _error, args) => [{ type: QueryTagTypes.Reports, id: args.reportId }],
    },
    reviewOneAcceleratorReport: {
      invalidatesTags: (_results, _error, args) => [{ type: QueryTagTypes.Reports, id: args.reportId }],
    },
    submitOneAcceleratorReport: {
      invalidatesTags: (_results, _error, reportId) => [{ type: QueryTagTypes.Reports, id: reportId }],
    },
    publishOneAcceleratorReport: {
      invalidatesTags: (_results, _error, reportId) => [
        { type: QueryTagTypes.Reports, id: reportId },
        { type: QueryTagTypes.PublishedReports, id: 'LIST' },
      ],
    },
    getOneAcceleratorReportPhoto: {
      providesTags: (_results, _error, args) => [{ type: QueryTagTypes.ReportMedia, id: args.fileId }],
    },
    uploadOneAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [{ type: QueryTagTypes.Reports, id: args.reportId }],
    },
    updateOneAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [
        { type: QueryTagTypes.ReportMedia, id: args.fileId },
        { type: QueryTagTypes.Reports, id: args.reportId },
      ],
    },
    deleteOneAcceleratorReportPhoto: {
      invalidatesTags: (_results, _error, args) => [{ type: QueryTagTypes.Reports, id: args.reportId }],
    },
  },
});
