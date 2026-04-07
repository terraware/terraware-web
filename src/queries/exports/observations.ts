import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
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
            'quadratSpecies_abundanceCount',
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
  useExportObservationGpxQuery,
  useLazyExportObservationGpxQuery,
  useExportBiomassPlotsCsvQuery,
  useLazyExportBiomassPlotsCsvQuery,
  useExportBiomassSpeciesCsvQuery,
  useLazyExportBiomassSpeciesCsvQuery,
  useExportBiomassTreesShrubsCsvQuery,
  useLazyExportBiomassTreesShrubsCsvQuery,
} = injectedRtkApi;
