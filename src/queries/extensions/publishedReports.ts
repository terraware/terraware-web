import { api } from '../generated/publishedReports';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listPublishedReports: {
      providesTags: (results) => [
        ...(results?.reports.map((report) => ({ type: QueryTagTypes.PublishedReports, id: report.reportId })) ?? []),
        { type: QueryTagTypes.PublishedReports, id: 'LIST' },
      ],
    },
    getPublishedReportPhoto: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.PublishedReportMedia, id: payload.fileId }],
    },
  },
});
