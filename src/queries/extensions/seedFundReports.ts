import { api } from '../generated/seedFundReports';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listReports: {
      providesTags: (results) => [
        ...(results?.reports.map((report) => ({ type: QueryTagTypes.SeedFundReports, id: report.id })) ?? []),
        { type: QueryTagTypes.SeedFundReports, id: 'LIST' },
      ],
    },
    getReport: {
      providesTags: (_results, _error, reportId) => [{ type: QueryTagTypes.SeedFundReports, id: reportId }],
    },
    updateReport: {
      invalidatesTags: (_results, _error, args) => [
        { type: QueryTagTypes.SeedFundReports, id: args.id },
        { type: QueryTagTypes.SeedFundReports, id: 'LIST' },
      ],
    },
    lockReport: {
      invalidatesTags: (_results, _error, reportId) => [
        { type: QueryTagTypes.SeedFundReports, id: reportId },
        { type: QueryTagTypes.SeedFundReports, id: 'LIST' },
      ],
    },
    forceLockReport: {
      invalidatesTags: (_results, _error, reportId) => [
        { type: QueryTagTypes.SeedFundReports, id: reportId },
        { type: QueryTagTypes.SeedFundReports, id: 'LIST' },
      ],
    },
    unlockReport: {
      invalidatesTags: (_results, _error, reportId) => [
        { type: QueryTagTypes.SeedFundReports, id: reportId },
        { type: QueryTagTypes.SeedFundReports, id: 'LIST' },
      ],
    },
    submitReport: {
      invalidatesTags: (_results, _error, reportId) => [
        { type: QueryTagTypes.SeedFundReports, id: reportId },
        { type: QueryTagTypes.SeedFundReports, id: 'LIST' },
      ],
    },
    getReportSettings: {
      providesTags: [{ type: QueryTagTypes.SeedFundReports, id: 'SETTINGS' }],
    },
    updateReportSettings: {
      invalidatesTags: [
        { type: QueryTagTypes.SeedFundReports, id: 'SETTINGS' },
        { type: QueryTagTypes.SeedFundReports, id: 'LIST' },
      ],
    },
    listReportFiles: {
      providesTags: (_results, _error, reportId) => [{ type: QueryTagTypes.SeedFundReportMedia, id: reportId }],
    },
    uploadReportFile: {
      invalidatesTags: (_results, _error, args) => [{ type: QueryTagTypes.SeedFundReportMedia, id: args.reportId }],
    },
    deleteReportFile: {
      invalidatesTags: (_results, _error, args) => [{ type: QueryTagTypes.SeedFundReportMedia, id: args.reportId }],
    },
    listReportPhotos: {
      providesTags: (_results, _error, reportId) => [{ type: QueryTagTypes.SeedFundReportMedia, id: reportId }],
    },
    uploadReportPhoto: {
      invalidatesTags: (_results, _error, args) => [{ type: QueryTagTypes.SeedFundReportMedia, id: args.reportId }],
    },
    deleteReportPhoto: {
      invalidatesTags: (_results, _error, args) => [{ type: QueryTagTypes.SeedFundReportMedia, id: args.reportId }],
    },
    updateReportPhoto: {
      invalidatesTags: (_results, _error, args) => [{ type: QueryTagTypes.SeedFundReportMedia, id: args.reportId }],
    },
  },
});
