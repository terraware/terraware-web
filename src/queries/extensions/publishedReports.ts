import { api } from '../generated/publishedReports';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listPublishedReports: {
      providesTags: (results) => [
        ...(results?.reports.map((report) => ({
          type: QueryTagTypes.PublishedAcceleratorReport,
          id: report.reportId,
        })) ?? []),
        { type: QueryTagTypes.PublishedAcceleratorReport, id: 'LIST' },
      ],
    },
    getPublishedReportPhoto: {
      providesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.PublishedAcceleratorReportMedia, id: payload.fileId },
      ],
    },
  },
});
