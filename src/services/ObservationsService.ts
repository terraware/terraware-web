import { paths } from 'src/api/types/generated-schema';
import {
  Observation,
  ObservationResultsPayload,
  ReplaceObservationPlotRequestPayload,
  ReplaceObservationPlotResponsePayload,
  RescheduleObservationRequestPayload,
  ScheduleObservationRequestPayload,
} from 'src/types/Observations';

import HttpService, { Response, Response2 } from './HttpService';
import SearchService from './SearchService';

/**
 * Tracking observations related services
 */

const OBSERVATIONS_RESULTS_ENDPOINT = '/api/v1/tracking/observations/results';
const OBSERVATIONS_ENDPOINT = '/api/v1/tracking/observations';
const AD_HOC_OBSERVATIONS_ENDPOINT = '/api/v1/tracking/observations/adHoc';
const OBSERVATION_ENDPOINT = '/api/v1/tracking/observations/{observationId}';
const OBSERVATION_EXPORT_ENDPOINT = '/api/v1/tracking/observations/{observationId}/plots';
const REPLACE_OBSERVATION_PLOT_ENDPOINT = '/api/v1/tracking/observations/{observationId}/plots/{plotId}/replace';
const PLANTING_SITE_OBSERVATIONS_SUMMARIES_ENDPOINT = '/api/v1/tracking/observations/results/summaries';
const ABANDON_OBSERVATION_ENDPOINT = '/api/v1/tracking/observations/{observationId}/abandon';
const AD_HOC_OBSERVATIONS_RESULTS_ENDPOINT = '/api/v1/tracking/observations/adHoc/results';

type ObservationsResultsResponsePayload =
  paths[typeof OBSERVATIONS_RESULTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type ObservationsResponsePayload =
  paths[typeof OBSERVATIONS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type GetPlantingSiteObservationSummariesPayload =
  paths[typeof PLANTING_SITE_OBSERVATIONS_SUMMARIES_ENDPOINT]['get']['responses'][200]['content']['application/json'];

/**
 * exported response type
 */
export type ObservationsResultsData = {
  observations: ObservationResultsPayload[];
};

export type ObservationsData = {
  observations: Observation[];
};

const httpObservationsResults = HttpService.root(OBSERVATIONS_RESULTS_ENDPOINT);
const httpObservations = HttpService.root(OBSERVATIONS_ENDPOINT);
const httpAdHocObservations = HttpService.root(AD_HOC_OBSERVATIONS_ENDPOINT);
const httpObservation = HttpService.root(OBSERVATION_ENDPOINT);
const httpObservationExport = HttpService.root(OBSERVATION_EXPORT_ENDPOINT);
const httpAdHocObservationsResults = HttpService.root(AD_HOC_OBSERVATIONS_RESULTS_ENDPOINT);

const exportCsv = async (observationId: number): Promise<any> => {
  return SearchService.searchCsv({
    prefix: 'plantingSites.observations',
    fields: [
      'startDate',
      'plantingSite_name',
      'observationPlots_isPermanent',
      'observationPlots_monitoringPlot_plantingSubzone_plantingZone_name',
      'observationPlots_monitoringPlot_plantingSubzone_name',
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
  });
};

const exportBiomassObservationsCsv = async (organizationId: number, plantingSiteId?: number): Promise<any> => {
  let fieldName: string;
  let fieldValue: string;
  if (plantingSiteId && plantingSiteId > 0) {
    fieldName = 'plantingSite_id';
    fieldValue = `${plantingSiteId}`;
  } else {
    fieldName = 'plantingSite_organization_id';
    fieldValue = `${organizationId}`;
  }

  return SearchService.searchCsv({
    prefix: 'plantingSites.observations',
    fields: [
      'observationPlots_monitoringPlot_plotNumber',
      'observationPlots_biomassDetails_description',
      'plantingSite_name',
      'startDate',
      'observationPlots_biomassDetails_numPlants',
      'observationPlots_biomassDetails_numSpecies',
    ],
    sortOrder: [{ field: 'observationPlots_monitoringPlot_plotNumber', direction: 'Descending' }],
    search: {
      operation: 'and',
      children: [
        {
          operation: 'field',
          type: 'Exact',
          field: 'type(raw)',
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
  });
};

const exportBiomassDetailsCsv = async (observationId: number): Promise<any> => {
  return SearchService.searchCsv({
    prefix: 'plantingSites.observations',
    fields: [
      'observationPlots_monitoringPlot_plotNumber',
      'observationPlots_notes',
      'plantingSite_name',
      'observationPlots_completedTime',
      'observationPlots_monitoringPlot_southwestLatitude',
      'observationPlots_monitoringPlot_southwestLongitude',
      'observationPlots_monitoringPlot_northwestLatitude',
      'observationPlots_monitoringPlot_northwestLongitude',
      'observationPlots_monitoringPlot_southeastLatitude',
      'observationPlots_monitoringPlot_southeastLongitude',
      'observationPlots_monitoringPlot_northeastLatitude',
      'observationPlots_monitoringPlot_northeastLongitude',
      'observationPlots_biomassDetails_description',
      'observationPlots_biomassDetails_forestType',
      'observationPlots_biomassDetails_herbaceousCoverPercent',
      'observationPlots_biomassDetails_ph',
      'observationPlots_biomassDetails_smallTreesCountLow',
      'observationPlots_biomassDetails_smallTreesCountHigh',
      'observationPlots_biomassDetails_salinity',
      'observationPlots_biomassDetails_soilAssessment',
      'observationPlots_biomassDetails_tide',
      'observationPlots_biomassDetails_tideTime',
      'observationPlots_biomassDetails_waterDepth',
      'observationPlots_biomassDetails_numPlants',
      'observationPlots_biomassDetails_numSpecies',
      'observationPlots.conditions_condition',
    ],
    sortOrder: [{ field: 'observationPlots_monitoringPlot_plotNumber' }],
    search: {
      operation: 'field',
      type: 'Exact',
      field: 'id',
      values: [`${observationId}`],
    },
  });
};

const exportBiomassSpeciesCsv = async (observationId: number): Promise<any> => {
  return SearchService.searchCsv({
    prefix: 'plantingSites.observations.observationPlots.biomassDetails.species',
    fields: ['name', 'quadratSpecies_position', 'quadratSpecies_abundancePercent', 'isInvasive', 'isThreatened'],
    sortOrder: [{ field: 'name' }, { field: 'quadratSpecies_position' }],
    search: {
      operation: 'and',
      children: [{ operation: 'field', type: 'Exact', field: 'observation_id', values: [`${observationId}`] }],
    },
  });
};

const exportBiomassTreesShrubsCsv = async (observationId: number): Promise<any> => {
  return SearchService.searchCsv({
    prefix: 'plantingSites.observations.observationPlots.recordedTrees',
    fields: [
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
const listObservationsResults = async (
  organizationId: number,
  plantingSiteId?: number
): Promise<ObservationsResultsData & Response> => {
  const params: Record<string, string> = plantingSiteId ? { plantingSiteId: plantingSiteId.toString() } : {};
  const response: ObservationsResultsData & Response = await httpObservationsResults.get<
    ObservationsResultsResponsePayload,
    ObservationsResultsData
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
): Promise<Response & ReplaceObservationPlotResponsePayload> => {
  const serverResponse: Response = await HttpService.root(REPLACE_OBSERVATION_PLOT_ENDPOINT).post({
    urlReplacements: {
      '{observationId}': observationId.toString(),
      '{plotId}': plotId.toString(),
    },
    entity: request,
  });

  return {
    ...serverResponse,
    addedMonitoringPlotIds: serverResponse.data?.addedMonitoringPlotIds ?? [],
    removedMonitoringPlotIds: serverResponse.data?.removedMonitoringPlotIds ?? [],
  };
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

const listAdHocObservationsResults = async (
  organizationId: number,
  plantingSiteId?: number
): Promise<ObservationsResultsData & Response> => {
  const params: Record<string, string> = plantingSiteId ? { plantingSiteId: plantingSiteId.toString() } : {};
  const response: ObservationsResultsData & Response = await httpAdHocObservationsResults.get<
    ObservationsResultsResponsePayload,
    ObservationsResultsData
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
  exportBiomassDetailsCsv,
  exportBiomassObservationsCsv,
  exportBiomassSpeciesCsv,
  exportBiomassTreesShrubsCsv,
  exportCsv,
  exportGpx,
  listObservationsResults,
  listObservations,
  listAdHocObservations,
  replaceObservationPlot,
  rescheduleObservation,
  scheduleObservation,
  getPlantingSiteObservationsSummaries,
  abandonObservation,
  listAdHocObservationsResults,
};

export default ObservationsService;
