import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from './HttpService';
import { Observation, ObservationResultsPayload } from 'src/types/Observations';

/**
 * Tracking observations related services
 */

const OBSERVATIONS_RESULTS_ENDPOINT = '/api/v1/tracking/observations/results';
const OBSERVATIONS_ENDPOINT = '/api/v1/tracking/observations';

type ObservationsResultsResponsePayload =
  paths[typeof OBSERVATIONS_RESULTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type ObservationsResponsePayload =
  paths[typeof OBSERVATIONS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

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

/**
 * Exported functions
 */
const ObservationsService = {
  listObservationsResults,
  listObservations,
};

export default ObservationsService;
