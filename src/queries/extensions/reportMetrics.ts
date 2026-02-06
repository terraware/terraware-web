import { api } from '../generated/reportMetrics';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listStandardMetric: {
      providesTags: (results) => [
        ...(results?.metrics.map((metric) => ({ type: QueryTagTypes.StandardMetrics, id: metric.id })) ?? []),
        { type: QueryTagTypes.StandardMetrics, id: 'LIST' },
      ],
    },
    updateStandardMetric: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.StandardMetrics, id: payload.metricId },
        { type: QueryTagTypes.Reports }, // invalidate all reports
      ],
    },
    createStandardMetric: {
      invalidatesTags: () => [
        { type: QueryTagTypes.Reports }, // invalidate all reports
      ],
    },
    listSystemMetrics: {
      providesTags: (results) => [
        ...(results?.metrics.map((metric) => ({ type: QueryTagTypes.SystemMetrics, id: metric.metric })) ?? []),
        { type: QueryTagTypes.SystemMetrics, id: 'LIST' },
      ],
    },
  },
});
