import { paths } from 'src/api/types/generated-schema';
import {
  Observation,
  ObservationResultsPayload,
  ReplaceObservationPlotRequestPayload,
  ReplaceObservationPlotResponseFullPayload,
  ReplaceObservationPlotResponsePayload,
  RescheduleObservationRequestPayload,
  ScheduleObservationRequestPayload,
} from 'src/types/Observations';

import HttpService, { Response, Response2 } from './HttpService';
import SearchService from './SearchService';

/**
 * Tracking observations related services
 */

const AD_HOC_OBSERVATIONS_ENDPOINT = '/api/v1/tracking/observations/adHoc';
const AD_HOC_OBSERVATION_RESULTS_ENDPOINT = '/api/v1/tracking/observations/adHoc/results';
const OBSERVATIONS_ENDPOINT = '/api/v1/tracking/observations';
const OBSERVATIONS_RESULTS_ENDPOINT = '/api/v1/tracking/observations/results';
const OBSERVATION_ENDPOINT = '/api/v1/tracking/observations/{observationId}';
const OBSERVATION_RESULTS_ENDPOINT = '/api/v1/tracking/observations/{observationId}/results';
const OBSERVATION_EXPORT_ENDPOINT = '/api/v1/tracking/observations/{observationId}/plots';
const REPLACE_OBSERVATION_PLOT_ENDPOINT = '/api/v1/tracking/observations/{observationId}/plots/{plotId}/replace';
const PLANTING_SITE_OBSERVATIONS_SUMMARIES_ENDPOINT = '/api/v1/tracking/observations/results/summaries';
const ABANDON_OBSERVATION_ENDPOINT = '/api/v1/tracking/observations/{observationId}/abandon';

type AdHocObservationsPayload =
  paths[typeof AD_HOC_OBSERVATIONS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type AdHocObservationResultsPayload =
  paths[typeof AD_HOC_OBSERVATION_RESULTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type ObservationResultsResponsePayload =
  paths[typeof OBSERVATIONS_RESULTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type ObservationsResponsePayload =
  paths[typeof OBSERVATIONS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type GetOneObservationRepsonsePayload =
  paths[typeof OBSERVATION_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type GetOneObservationResultsRepsonsePayload =
  paths[typeof OBSERVATION_RESULTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type GetPlantingSiteObservationSummariesPayload =
  paths[typeof PLANTING_SITE_OBSERVATIONS_SUMMARIES_ENDPOINT]['get']['responses'][200]['content']['application/json'];

/**
 * exported response type
 */
export type ObservationResultsData = {
  observations: ObservationResultsPayload[];
};

export type ObservationsData = {
  observations: Observation[];
};

const httpAdHocObservations = HttpService.root(AD_HOC_OBSERVATIONS_ENDPOINT);
const httpAdHocObservationResults = HttpService.root(AD_HOC_OBSERVATION_RESULTS_ENDPOINT);
const httpObservationResults = HttpService.root(OBSERVATIONS_RESULTS_ENDPOINT);
const httpObservations = HttpService.root(OBSERVATIONS_ENDPOINT);
const httpObservation = HttpService.root(OBSERVATION_ENDPOINT);
const httpObservationExport = HttpService.root(OBSERVATION_EXPORT_ENDPOINT);

const exportCsv = async (observationId: number): Promise<any> => {
  return SearchService.searchCsv({
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
  });
};

const exportBiomassPlotCsvByField = (fieldName: string, fieldValue: string) =>
  SearchService.searchCsv({
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
          field: fieldName,
          values: [fieldValue],
        },
      ],
    },
    count: 0,
  });

const exportBiomassObservationsCsv = async (organizationId: number, plantingSiteId?: number): Promise<any> => {
  if (plantingSiteId && plantingSiteId > 0) {
    return exportBiomassPlotCsvByField('monitoringPlot_plantingSite_id', `${plantingSiteId}`);
  } else {
    return exportBiomassPlotCsvByField('monitoringPlot_plantingSite_organization_id', `${organizationId}`);
  }
};

const exportBiomassPlotCsv = async (observationId: number): Promise<any> => {
  return exportBiomassPlotCsvByField('observation_id', `${observationId}`);
};

const exportBiomassSpeciesCsv = async (observationId: number): Promise<any> => {
  return SearchService.searchCsv({
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
  });
};

const exportBiomassTreesShrubsCsv = async (observationId: number): Promise<any> => {
  return SearchService.searchCsv({
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
  });
};

const exportGpx = async (observationId: number): Promise<any> => {
  const headers = {
    accept: 'application/gpx+xml',
  };
  try {
    const response = await httpObservationExport.get2({
      headers,
      urlReplacements: {
        '{observationId}': observationId.toString(),
      },
    });
    if (response.requestSucceeded && response.data) {
      return response.data;
    } else {
      return Promise.reject(response.error);
    }
  } catch {
    return null;
  }
};

/**
 * List all observations results
 */
const listObservationResults = async (
  organizationId: number,
  plantingSiteId?: number
): Promise<ObservationResultsData & Response> => {
  const params: Record<string, string> = plantingSiteId ? { plantingSiteId: plantingSiteId.toString() } : {};
  const response: ObservationResultsData & Response = await httpObservationResults.get<
    ObservationResultsResponsePayload,
    ObservationResultsData
  >(
    {
      params: {
        organizationId: organizationId.toString(),
        ...params,
      },
    },
    (data) => ({ observations: data?.observations ?? [] })
  );

  return response;
};

const listObservations = async (organizationId: number): Promise<ObservationsData & Response> => {
  const response: ObservationsData & Response = await httpObservations.get<
    ObservationsResponsePayload,
    ObservationsData
  >(
    {
      params: {
        organizationId: organizationId.toString(),
      },
    },
    (data) => ({ observations: data?.observations ?? [] })
  );

  return response;
};

/**
 * List planting site observations results
 */
const listPlantingSiteObservationResults = async (
  plantingSiteId: number
): Promise<Response2<ObservationResultsResponsePayload>> => {
  const response = await httpObservationResults.get2<ObservationResultsResponsePayload>({
    params: {
      plantingSiteId: plantingSiteId.toString(),
    },
  });

  return response;
};

const listPlantingSiteObservations = async (
  plantingSiteId: number
): Promise<Response2<ObservationsResponsePayload>> => {
  const response = await httpObservations.get2<ObservationsResponsePayload>({
    params: {
      plantingSiteId: plantingSiteId.toString(),
    },
  });

  return response;
};

const listPlantingSiteAdHocObservations = async (
  plantingSiteId: number
): Promise<Response2<AdHocObservationsPayload>> => {
  const response = await httpAdHocObservations.get2<ObservationsResponsePayload>({
    params: {
      plantingSiteId: plantingSiteId.toString(),
    },
  });

  return response;
};

const listPlantingSiteAdHocObservationResults = async (
  plantingSiteId: number
): Promise<Response2<AdHocObservationResultsPayload>> => {
  const response = await httpAdHocObservationResults.get2<AdHocObservationResultsPayload>({
    params: {
      plantingSiteId: plantingSiteId.toString(),
    },
  });

  return response;
};

/**
 * List organization  observations results
 */
const listOrganizationObservationResults = async (
  organizationId: number
): Promise<Response2<ObservationResultsResponsePayload>> => {
  const response = await httpObservationResults.get2<ObservationResultsResponsePayload>({
    params: {
      organizationId: organizationId.toString(),
    },
  });

  return response;
};

const listOrganizationObservations = async (
  organizationId: number
): Promise<Response2<ObservationsResponsePayload>> => {
  const response = await httpObservations.get2<ObservationsResponsePayload>({
    params: {
      organizationId: organizationId.toString(),
    },
  });

  return response;
};

const listOrganizationAdHocObservations = async (
  organizationId: number
): Promise<Response2<AdHocObservationsPayload>> => {
  const response = await httpAdHocObservations.get2<ObservationsResponsePayload>({
    params: {
      organizationId: organizationId.toString(),
    },
  });

  return response;
};

const listOrganizationAdHocObservationResults = async (
  organizationId: number
): Promise<Response2<AdHocObservationResultsPayload>> => {
  const response = await httpAdHocObservationResults.get2<AdHocObservationResultsPayload>({
    params: {
      organizationId: organizationId.toString(),
    },
  });

  return response;
};

const listAdHocObservations = async (organizationId: number): Promise<ObservationsData & Response> => {
  const response: ObservationsData & Response = await httpAdHocObservations.get<
    ObservationsResponsePayload,
    ObservationsData
  >(
    {
      params: {
        organizationId: organizationId.toString(),
      },
    },
    (data) => ({ observations: data?.observations ?? [] })
  );

  return response;
};

const scheduleObservation = async (request: ScheduleObservationRequestPayload): Promise<Response> =>
  await httpObservations.post({ entity: request });

const rescheduleObservation = async (
  observationId: number,
  request: RescheduleObservationRequestPayload
): Promise<Response> =>
  await httpObservation.put({
    urlReplacements: {
      '{observationId}': observationId.toString(),
    },
    entity: request,
  });

const replaceObservationPlot = async (
  observationId: number,
  plotId: number,
  request: ReplaceObservationPlotRequestPayload
): Promise<Response2<ReplaceObservationPlotResponsePayload>> => {
  return await HttpService.root(REPLACE_OBSERVATION_PLOT_ENDPOINT).post2<ReplaceObservationPlotResponseFullPayload>({
    urlReplacements: {
      '{observationId}': observationId.toString(),
      '{plotId}': plotId.toString(),
    },
    entity: request,
  });
};

const getOneObservation = async (observationId: number): Promise<Response2<GetOneObservationRepsonsePayload>> => {
  return HttpService.root(OBSERVATION_ENDPOINT).get2<GetOneObservationRepsonsePayload>({
    urlReplacements: {
      '{observationId}': observationId.toString(),
    },
  });
};

const getOneObservationResults = async (
  observationId: number,
  includePlants?: boolean
): Promise<Response2<GetOneObservationResultsRepsonsePayload>> => {
  const params = { includePlants: (!!includePlants).toString() };

  return HttpService.root(OBSERVATION_RESULTS_ENDPOINT).get2<GetOneObservationResultsRepsonsePayload>({
    urlReplacements: {
      '{observationId}': observationId.toString(),
    },
    params,
  });
};

const getPlantingSiteObservationsSummaries = async (
  plantingSiteId: number
): Promise<Response2<GetPlantingSiteObservationSummariesPayload>> => {
  return HttpService.root(
    PLANTING_SITE_OBSERVATIONS_SUMMARIES_ENDPOINT
  ).get2<GetPlantingSiteObservationSummariesPayload>({
    params: {
      plantingSiteId: plantingSiteId.toString(),
    },
  });
};

const abandonObservation = async (observationId: number): Promise<Response> => {
  return await HttpService.root(ABANDON_OBSERVATION_ENDPOINT).post({
    urlReplacements: {
      '{observationId}': observationId.toString(),
    },
  });
};

const listAdHocObservationResults = async (
  organizationId: number,
  plantingSiteId?: number
): Promise<ObservationResultsData & Response> => {
  const params: Record<string, string> = plantingSiteId ? { plantingSiteId: plantingSiteId.toString() } : {};
  const response: ObservationResultsData & Response = await httpAdHocObservationResults.get<
    ObservationResultsResponsePayload,
    ObservationResultsData
  >(
    {
      params: {
        organizationId: organizationId.toString(),
        ...params,
      },
    },
    (data) => ({ observations: data?.observations ?? [] })
  );

  return response;
};

/**
 * Exported functions
 */
const ObservationsService = {
  exportBiomassObservationsCsv,
  exportBiomassPlotCsv,
  exportBiomassSpeciesCsv,
  exportBiomassTreesShrubsCsv,
  exportCsv,
  exportGpx,
  listObservationResults,
  listObservations,
  listAdHocObservations,
  replaceObservationPlot,
  rescheduleObservation,
  scheduleObservation,
  getOneObservation,
  getOneObservationResult: getOneObservationResults,
  getPlantingSiteObservationsSummaries,
  abandonObservation,
  listAdHocObservationResults,
  listPlantingSiteObservations,
  listPlantingSiteObservationResults,
  listPlantingSiteAdHocObservations,
  listPlantingSiteAdHocObservationResults,
  listOrganizationObservations,
  listOrganizationObservationResults,
  listOrganizationAdHocObservations,
  listOrganizationAdHocObservationResults,
};

export default ObservationsService;
