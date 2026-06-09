import Coordinates from 'coordinate-parser';

import { paths } from 'src/api/types/generated-schema';
import { ACCESSION_2_STATES, AccessionState, Geolocation } from 'src/types/Accession';

import HttpService, { Response2 } from './HttpService';

/**
 * Service for accessions related functionality
 */

const ACCESSION_HISTORY_ENDPOINT = '/api/v1/seedbank/accessions/{id}/history';
const VIABILITY_TESTS_ENDPOINT = '/api/v2/seedbank/accessions/{accessionId}/viabilityTests';
const TRANSFER_TO_NURSERY_ENDPOINT = '/api/v2/seedbank/accessions/{accessionId}/transfers/nursery';

type GetAccessionHistoryResponsePayload =
  paths[typeof ACCESSION_HISTORY_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type AccessionHistory = GetAccessionHistoryResponsePayload['history'];

export type AccessionHistoryEntry = Required<AccessionHistory>[0];

export type ViabilityTestPostRequest =
  paths[typeof VIABILITY_TESTS_ENDPOINT]['post']['requestBody']['content']['application/json'];

type TransferToNurseryRequestBody =
  paths[typeof TRANSFER_TO_NURSERY_ENDPOINT]['post']['requestBody']['content']['application/json'];
type TransferToNurseryResponseBody =
  paths[typeof TRANSFER_TO_NURSERY_ENDPOINT]['post']['responses'][200]['content']['application/json'];

const httpNurseryTransfer = HttpService.root(TRANSFER_TO_NURSERY_ENDPOINT);

/**
 * Create a nursery withdrawal/transfer
 */
const transferToNursery = async (
  entity: TransferToNurseryRequestBody,
  accessionId: number
): Promise<Response2<TransferToNurseryResponseBody>> =>
  httpNurseryTransfer.post2<TransferToNurseryResponseBody>({
    entity,
    urlReplacements: {
      '{accessionId}': accessionId.toString(),
    },
  });

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
  transferToNursery,
  getTransitionToStates,
  getParsedCoords,
};

export default AccessionService;
