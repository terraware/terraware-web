import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    exportObservationCsv: build.query<string, number>({
      query: (observationId) => ({
        url: '/api/v1/search',
        method: 'POST',
        headers: {
          accept: 'text/csv',
        },
        body: {
          prefix: 'observations',
          fields: [
            'startDate',
            'plantingSite_name',
            'observationPlots_isPermanent',
            'observationPlots_monitoringPlot_substratum_stratum_name',
            'observationPlots_monitoringPlot_substratum_name',
            'observationPlots_monitoringPlot_plotNumber',
            'observationPlots_monitoringPlot_southwestLatitude',
            'observationPlots_monitoringPlot_southwestLongitude',
            'observationPlots_monitoringPlot_northwestLatitude',
            'observationPlots_monitoringPlot_northwestLongitude',
            'observationPlots_monitoringPlot_southeastLatitude',
            'observationPlots_monitoringPlot_southeastLongitude',
            'observationPlots_monitoringPlot_northeastLatitude',
            'observationPlots_monitoringPlot_northeastLongitude',
          ],
          sortOrder: [{ field: 'observationPlots_monitoringPlot_id' }],
          search: {
            operation: 'field',
            type: 'Exact',
            field: 'id',
            values: [`${observationId}`],
          },
          count: 0,
        },
        responseHandler: 'text',
      }),
      providesTags: (_results, _errors, observationId) => [{ type: QueryTagTypes.Observation, id: observationId }],
    }),
    exportObservationGpx: build.query<string, number>({
      query: (observationId) => ({
        url: `/api/v1/tracking/observations/${observationId}/plots`,
        headers: {
          accept: 'application/gpx+xml',
        },
        responseHandler: 'text',
      }),
      providesTags: (_results, _errors, observationId) => [{ type: QueryTagTypes.Observation, id: observationId }],
    }),
  }),
});

export { injectedRtkApi as api };

export const {
  useExportObservationCsvQuery,
  useLazyExportObservationCsvQuery,
  useExportObservationGpxQuery,
  useLazyExportObservationGpxQuery,
} = injectedRtkApi;
