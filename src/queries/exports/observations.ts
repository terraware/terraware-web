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
    exportBiomassPlotsCsv: build.query<string, number>({
      query: (observationId) => ({
        url: '/api/v1/search',
        method: 'POST',
        headers: {
          accept: 'text/csv',
        },
        body: {
          prefix: 'observationPlots',
          fields: [
            'monitoringPlot_plotNumber',
            'monitoringPlot_plantingSite_name',
            'completedTime',
            'biomassDetails_description',
            'monitoringPlot_southwestLatitude',
            'monitoringPlot_southwestLongitude',
            'monitoringPlot_northwestLatitude',
            'monitoringPlot_northwestLongitude',
            'monitoringPlot_southeastLatitude',
            'monitoringPlot_southeastLongitude',
            'monitoringPlot_northeastLatitude',
            'monitoringPlot_northeastLongitude',
            'biomassDetails_forestType',
            'biomassDetails_herbaceousCoverPercent',
            'biomassDetails_ph',
            'biomassDetails_smallTreesCountLow',
            'biomassDetails_smallTreesCountHigh',
            'biomassDetails_salinity',
            'biomassDetails_soilAssessment',
            'biomassDetails_tide',
            'biomassDetails_tideTime',
            'biomassDetails_waterDepth',
            'biomassDetails_numPlants',
            'biomassDetails_numSpecies',
            'conditions.condition',
            'notes',
          ],
          sortOrder: [{ field: 'monitoringPlot_plotNumber', direction: 'Descending' }],
          search: {
            operation: 'and',
            children: [
              {
                operation: 'field',
                type: 'Exact',
                field: 'observation_type(raw)',
                values: ['Biomass Measurements'],
              },
              {
                operation: 'field',
                type: 'Exact',
                field: 'observation_id',
                values: [`${observationId}`],
              },
            ],
          },
          count: 0,
        },
        responseHandler: 'text',
      }),
      providesTags: (_results, _errors, observationId) => [{ type: QueryTagTypes.Observation, id: observationId }],
    }),
    exportBiomassSpeciesCsv: build.query<string, number>({
      query: (observationId) => ({
        url: '/api/v1/search',
        method: 'POST',
        headers: {
          accept: 'text/csv',
        },
        body: {
          prefix: 'observationBiomassSpecies',
          fields: [
            'monitoringPlot_plotNumber',
            'name',
            'quadratSpecies_position',
            'quadratSpecies_abundancePercent',
            'isInvasive',
            'isThreatened',
          ],
          sortOrder: [{ field: 'name' }, { field: 'quadratSpecies_position' }],
          search: {
            operation: 'and',
            children: [{ operation: 'field', type: 'Exact', field: 'observation_id', values: [`${observationId}`] }],
          },
          count: 0,
        },
        responseHandler: 'text',
      }),
      providesTags: (_results, _errors, observationId) => [{ type: QueryTagTypes.Observation, id: observationId }],
    }),
    exportBiomassTreesShrubsCsv: build.query<string, number>({
      query: (observationId) => ({
        url: '/api/v1/search',
        method: 'POST',
        headers: {
          accept: 'text/csv',
        },
        body: {
          prefix: 'recordedTrees',
          fields: [
            'monitoringPlot_plotNumber',
            'treeNumber',
            'trunkNumber',
            'biomassSpecies_name',
            'growthForm',
            'diameterAtBreastHeight',
            'pointOfMeasurement',
            'height',
            'shrubDiameter',
            'biomassSpecies_isInvasive',
            'biomassSpecies_isThreatened',
            'isDead',
            'description',
          ],
          sortOrder: [{ field: 'biomassSpecies_name' }, { field: 'treeNumber' }, { field: 'trunkNumber' }],
          search: {
            operation: 'field',
            type: 'Exact',
            field: 'observation_id',
            values: [`${observationId}`],
          },
          count: 0,
        },
        responseHandler: 'text',
      }),
      providesTags: (_results, _errors, observationId) => [{ type: QueryTagTypes.Observation, id: observationId }],
    }),
  }),
});

export type ExportBiomassObservationsApiArg = {
  organizationId: number;
  plantingSiteId?: number;
};

export { injectedRtkApi as api };

export const {
  useExportObservationCsvQuery,
  useLazyExportObservationCsvQuery,
  useExportObservationGpxQuery,
  useLazyExportObservationGpxQuery,
  useExportBiomassPlotsCsvQuery,
  useLazyExportBiomassPlotsCsvQuery,
  useExportBiomassSpeciesCsvQuery,
  useLazyExportBiomassSpeciesCsvQuery,
  useExportBiomassTreesShrubsCsvQuery,
  useLazyExportBiomassTreesShrubsCsvQuery,
} = injectedRtkApi;
