import Coordinates from 'coordinate-parser';
import { paths } from 'src/api/types/generated-schema';
import { Accession, ACCESSION_2_STATES, AccessionState, Geolocation } from 'src/types/Accession';
import HttpService, { Response } from './HttpService';

/**
 * Service for accessions related functionality
 */

const ACCESSION_ENDPOINT = '/api/v2/seedbank/accessions/{id}';
const ACCESSION_DELETE_ENDPOINT = '/api/v1/seedbank/accessions/{id}';
const ACCESSION_HISTORY_ENDPOINT = '/api/v1/seedbank/accessions/{id}/history';
const ACCESSION_CHECKIN_ENDPOINT = '/api/v1/seedbank/accessions/{id}/checkIn';
const VIABILITY_TESTS_ENDPOINT = '/api/v2/seedbank/accessions/{accessionId}/viabilityTests';
const VIABILITY_TEST_ENDPOINT = '/api/v2/seedbank/accessions/{accessionId}/viabilityTests/{viabilityTestId}';
const WITHDRAWALS_ENDPOINT = '/api/v2/seedbank/accessions/{accessionId}/withdrawals';
const TRANSFER_TO_NURSERY_ENDPOINT = '/api/v2/seedbank/accessions/{accessionId}/transfers/nursery';

type AccessionGetResponsePayload =
  paths[typeof ACCESSION_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type GetAccessionHistoryResponsePayload =
  paths[typeof ACCESSION_HISTORY_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type AccessionHistory = GetAccessionHistoryResponsePayload['history'];

export type AccessionHistoryEntry = Required<AccessionHistory>[0];

export type AccessionData = { accession?: Accession };
export type AccessionResponse = Response & AccessionData;
export type HistoryData = { history?: AccessionHistoryEntry[] };
export type AccessionHistoryResponse = Response & HistoryData;

export type ViabilityTestPostRequest =
  paths[typeof VIABILITY_TESTS_ENDPOINT]['post']['requestBody']['content']['application/json'];

export type ViabilityTestUpdateRequest =
  paths[typeof VIABILITY_TEST_ENDPOINT]['put']['requestBody']['content']['application/json'];

type WithdrawalsPostRequest = paths[typeof WITHDRAWALS_ENDPOINT]['post']['requestBody']['content']['application/json'];

type TransferToNurseryRequestBody =
  paths[typeof TRANSFER_TO_NURSERY_ENDPOINT]['post']['requestBody']['content']['application/json'];

const httpAccession = HttpService.root(ACCESSION_ENDPOINT);
const httpAccessionHistory = HttpService.root(ACCESSION_HISTORY_ENDPOINT);
const httpAccessionCheckin = HttpService.root(ACCESSION_CHECKIN_ENDPOINT);
const httpViabilityTests = HttpService.root(VIABILITY_TESTS_ENDPOINT);
const httpViabilityTest = HttpService.root(VIABILITY_TEST_ENDPOINT);
const httpWithdrawals = HttpService.root(WITHDRAWALS_ENDPOINT);
const httpNurseryTransfer = HttpService.root(TRANSFER_TO_NURSERY_ENDPOINT);

/**
 * Get an accession by id
 */
const getAccession = async (accessionId: number): Promise<AccessionResponse> => {
  const response: AccessionResponse = await httpAccession.get<AccessionGetResponsePayload, AccessionData>(
    {
      urlReplacements: { '{id}': accessionId.toString() },
    },
    (data) => ({ accession: data?.accession })
  );

  return response;
};

/**
 * Update an accession by id
 */
const updateAccession = async (entity: Accession, simulate?: boolean): Promise<AccessionResponse> => {
  const params = { simulate: simulate !== undefined ? simulate.toString() : 'false' };
  const serverResponse: Response = await httpAccession.put({
    entity,
    params,
    urlReplacements: { '{id}': entity.id.toString() },
  });
  const response: AccessionResponse = { ...serverResponse, accession: serverResponse?.data?.accession };

  return response;
};

/**
 * Accessions history
 */
const getAccessionHistory = async (accessionId: number): Promise<AccessionHistoryResponse> => {
  const response: Response = await httpAccessionHistory.get<GetAccessionHistoryResponsePayload, HistoryData>(
    {
      urlReplacements: { '{id}': accessionId.toString() },
    },
    (data) => ({ history: data?.history })
  );

  return response;
};

/**
 * Check-in an accession
 */
const checkInAccession = async (accessionId: number): Promise<Response> => {
  return await httpAccessionCheckin.post({
    urlReplacements: { '{id}': accessionId.toString() },
  });
};

/**
 * Delete an accession
 */
const deleteAccession = async (accessionId: number): Promise<Response> => {
  return await HttpService.root(ACCESSION_DELETE_ENDPOINT).delete({
    urlReplacements: { '{id}': accessionId.toString() },
  });
};

/**
 * Viability Tests
 */

/**
 * Create a viability test
 */
const createViabilityTest = async (viabilityTest: ViabilityTestPostRequest, accessionId: number): Promise<Response> => {
  return await httpViabilityTests.post({
    entity: viabilityTest,
    urlReplacements: {
      '{accessionId}': accessionId.toString(),
    },
  });
};

/**
 * Update a viability test
 */
const updateViabilityTest = async (
  viabilityTest: ViabilityTestUpdateRequest,
  accessionId: number,
  viabilityTestId: number
): Promise<Response> => {
  return await httpViabilityTest.put({
    entity: viabilityTest,
    urlReplacements: {
      '{accessionId}': accessionId.toString(),
      '{viabilityTestId}': viabilityTestId.toString(),
    },
  });
};

/**
 * Delete a viability test
 */
const deleteViabilityTest = async (accessionId: number, viabilityTestId: number): Promise<Response> => {
  return await httpViabilityTest.delete({
    urlReplacements: {
      '{accessionId}': accessionId.toString(),
      '{viabilityTestId}': viabilityTestId.toString(),
    },
  });
};

/**
 * Accession withdrawals
 */

/**
 * Create a withdrawal
 */
const createWithdrawal = async (withdrawal: WithdrawalsPostRequest, accessionId: number): Promise<Response> => {
  return await httpWithdrawals.post({
    entity: withdrawal,
    urlReplacements: {
      '{accessionId}': accessionId.toString(),
    },
  });
};

/**
 * Create a nursery withdrawal/transfer
 */

const transferToNursery = async (entity: TransferToNurseryRequestBody, accessionId: number): Promise<Response> => {
  return await httpNurseryTransfer.post({
    entity,
    urlReplacements: {
      '{accessionId}': accessionId.toString(),
    },
  });
};

/**
 * Get allowed transition-to states from current state
 */
const getTransitionToStates = (from: AccessionState): AccessionState[] => {
  switch (from) {
    case 'Awaiting Check-In': {
      return ['Awaiting Processing', 'Processing', 'Drying', 'In Storage', 'Used Up'];
    }
    case 'Awaiting Processing':
    case 'Processing':
    case 'Drying':
    case 'In Storage': {
      return ['Awaiting Processing', 'Processing', 'Drying', 'In Storage'];
    }
    default:
      return ACCESSION_2_STATES;
  }
};

/**
 * Get parsed coords from user input gps coords
 */
const getParsedCoords = (coordsStr: string[]): Geolocation[] => {
  return coordsStr
    .filter((coords) => !!coords.trim())
    .map((coords) => {
      try {
        const validCoords = new Coordinates(coords);
        return {
          latitude: validCoords.getLatitude(),
          longitude: validCoords.getLongitude(),
        } as Geolocation;
      } catch {
        // skip invalid coords
        return null;
      }
    })
    .filter((coords) => coords !== null) as Geolocation[];
};

/**
 * Exported functions
 */
const AccessionService = {
  getAccession,
  getAccessionHistory,
  checkInAccession,
  updateAccession,
  deleteAccession,
  createViabilityTest,
  updateViabilityTest,
  deleteViabilityTest,
  createWithdrawal,
  transferToNursery,
  getTransitionToStates,
  getParsedCoords,
};

export default AccessionService;
