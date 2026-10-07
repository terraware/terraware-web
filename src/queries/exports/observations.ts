import { SearchApiResponse } from 'src/queries/generated/search';
import strings from 'src/strings';
import { makeCsv } from 'src/utils/csv';

import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

const makeBiomassPlotsColumns = () => [
  { key: 'monitoringPlot_plotNumber(raw)', displayLabel: strings.MONITORING_PLOT_NUMBER },
  { key: 'monitoringPlot_plantingSite_name', displayLabel: strings.PLANTING_SITE_NAME },
  { key: 'completedTime', displayLabel: strings.PLOT_COMPLETED_TIME },
  { key: 'biomassDetails_description', displayLabel: strings.PLOT_DESCRIPTION },
  { key: 'monitoringPlot_southwestLatitude', displayLabel: strings.SOUTHWEST_CORNER_LATITUDE },
  { key: 'monitoringPlot_southwestLongitude', displayLabel: strings.SOUTHWEST_CORNER_LONGITUDE },
  { key: 'monitoringPlot_northwestLatitude', displayLabel: strings.NORTHWEST_CORNER_LATITUDE },
  { key: 'monitoringPlot_northwestLongitude', displayLabel: strings.NORTHWEST_CORNER_LONGITUDE },
  { key: 'monitoringPlot_southeastLatitude', displayLabel: strings.SOUTHEAST_CORNER_LATITUDE },
  { key: 'monitoringPlot_southeastLongitude', displayLabel: strings.SOUTHEAST_CORNER_LONGITUDE },
  { key: 'monitoringPlot_northeastLatitude', displayLabel: strings.NORTHEAST_CORNER_LATITUDE },
  { key: 'monitoringPlot_northeastLongitude', displayLabel: strings.NORTHEAST_CORNER_LONGITUDE },
  { key: 'biomassDetails_forestType', displayLabel: strings.FOREST_TYPE },
  { key: 'biomassDetails_herbaceousCoverPercent', displayLabel: strings.HERBACEOUS_COVER_PERCENT },
  { key: 'biomassDetails_smallTreesCountLow', displayLabel: strings.SMALL_TREES_COUNT_LOW },
  { key: 'biomassDetails_smallTreesCountHigh', displayLabel: strings.SMALL_TREES_COUNT_HIGH },
  { key: 'biomassDetails_soilType', displayLabel: strings.SOIL_TYPE },
  { key: 'biomassDetails_soilAssessment', displayLabel: strings.SOIL_ASSESSMENT },
  { key: 'biomassDetails_waterDepth', displayLabel: strings.WATER_DEPTH_CM },
  { key: 'biomassDetails_salinity', displayLabel: strings.SALINITY_PPT },
  { key: 'biomassDetails_ph', displayLabel: strings.PH_LEVEL },
  { key: 'biomassDetails_tide', displayLabel: strings.TIDE },
  { key: 'biomassDetails_tideTime', displayLabel: strings.TIME_OF_TIDE_MEASUREMENT },
  { key: 'biomassDetails_numPlants', displayLabel: strings.NUMBER_OF_PLANTS },
  { key: 'biomassDetails_numSpecies', displayLabel: strings.NUMBER_OF_SPECIES },
  { key: 'conditions.condition', displayLabel: strings.PLOT_CONDITIONS },
  { key: 'notes', displayLabel: strings.FIELD_NOTES },
  { key: 'monitoringPlotHistory_substratumHistory_stratumHistory_name', displayLabel: strings.STRATUM },
  { key: 'monitoringPlotHistory_substratumHistory_name', displayLabel: strings.SUBSTRATUM },
  { key: 'monitoringPlot_substratum_stratum_name', displayLabel: strings.STRATUM_CURRENT },
  { key: 'monitoringPlot_substratum_name', displayLabel: strings.SUBSTRATUM_CURRENT },
];

const transformBiomassPlotsToCsv = (results: SearchApiResponse): Blob => {
  // If there's no value for these fields, we'll add them with a message.
  const emptyAreaMessageKeys = [
    'monitoringPlotHistory_substratumHistory_stratumHistory_name',
    'monitoringPlotHistory_substratumHistory_name',
    'monitoringPlot_substratum_stratum_name',
    'monitoringPlot_substratum_name',
  ];

  const prettiedResults = results.results.map((result) => {
    const newResult: Record<string, any> = { ...result };

    if (newResult.conditions) {
      newResult['conditions.condition'] = (newResult.conditions as { condition: string }[])
        .map((c) => c.condition)
        .join('\r\n');
    }

    emptyAreaMessageKeys.forEach((key) => {
      if (!(key in newResult)) {
        newResult[key] = strings.OUTSIDE_CURRENT_SITE;
      }
    });

    return newResult;
  });

  return makeCsv(makeBiomassPlotsColumns(), prettiedResults, true, false);
};

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
    exportBiomassPlotsCsv: build.query<Blob, number[]>({
      query: (observationIds) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'observationPlots',
          fields: makeBiomassPlotsColumns().map((column) => column.key),
          sortOrder: [{ field: 'monitoringPlot_plotNumber', direction: 'Descending' }],
          search: {
            operation: 'field',
            type: 'Exact',
            field: 'observation_id',
            values: observationIds.map(String),
          },
          count: 0,
        },
      }),
      providesTags: (_results, _errors, observationIds) =>
        observationIds.map((id) => ({ type: QueryTagTypes.Observation, id })),
      transformResponse: transformBiomassPlotsToCsv,
    }),
    exportBiomassSpeciesCsv: build.query<string, number[]>({
      query: (observationIds) => ({
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
          sortOrder: [
            { field: 'monitoringPlot_plotNumber', direction: 'Descending' },
            { field: 'name' },
            { field: 'quadratSpecies_position' },
          ],
          search: {
            operation: 'and',
            children: [
              { operation: 'field', type: 'Exact', field: 'observation_id', values: observationIds.map(String) },
            ],
          },
          count: 0,
        },
        responseHandler: 'text',
      }),
      providesTags: (_results, _errors, observationIds) =>
        observationIds.map((id) => ({ type: QueryTagTypes.Observation, id })),
    }),
    exportBiomassTreesShrubsCsv: build.query<string, number[]>({
      query: (observationIds) => ({
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
            'treeCrownDiameter',
            'shrubDiameter',
            'boleHeight',
            'biomassSpecies_isInvasive',
            'biomassSpecies_isThreatened',
            'isDead',
            'description',
          ],
          sortOrder: [
            { field: 'monitoringPlot_plotNumber', direction: 'Descending' },
            { field: 'biomassSpecies_name' },
            { field: 'treeNumber' },
            { field: 'trunkNumber' },
          ],
          search: {
            operation: 'field',
            type: 'Exact',
            field: 'observation_id',
            values: observationIds.map(String),
          },
          count: 0,
        },
        responseHandler: 'text',
      }),
      providesTags: (_results, _errors, observationIds) =>
        observationIds.map((id) => ({ type: QueryTagTypes.Observation, id })),
    }),
    exportBiomassObservationsCsv: build.query<string, ExportBiomassObservationsApiArg>({
      query: ({ observationIds, organizationId, plantingSiteId }) => ({
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
              plantingSiteId && plantingSiteId > 0
                ? {
                    operation: 'field',
                    type: 'Exact',
                    field: 'monitoringPlot_plantingSite_id',
                    values: [`${plantingSiteId}`],
                  }
                : {
                    operation: 'field',
                    type: 'Exact',
                    field: 'monitoringPlot_plantingSite_organization_id',
                    values: [`${organizationId}`],
                  },
              ...(observationIds && observationIds.length > 0
                ? [
                    {
                      operation: 'field',
                      type: 'Exact',
                      field: 'observation_id',
                      values: observationIds.map(String),
                    },
                  ]
                : []),
            ],
          },
          count: 0,
        },
        responseHandler: 'text',
      }),
    }),
  }),
});

type ExportBiomassObservationsApiArg = {
  observationIds?: number[];
  organizationId: number;
  plantingSiteId?: number;
};

export const {
  useLazyExportObservationGpxQuery,
  useLazyExportBiomassPlotsCsvQuery,
  useLazyExportBiomassSpeciesCsvQuery,
  useLazyExportBiomassTreesShrubsCsvQuery,
  useLazyExportBiomassObservationsCsvQuery,
} = injectedRtkApi;
