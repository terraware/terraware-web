import Coordinates from 'coordinate-parser';

import { paths } from 'src/api/types/generated-schema';
import { ACCESSION_2_STATES, AccessionState, Geolocation } from 'src/types/Accession';

/**
 * Service for accessions related functionality
 */

const ACCESSION_HISTORY_ENDPOINT = '/api/v1/seedbank/accessions/{id}/history';
const VIABILITY_TESTS_ENDPOINT = '/api/v2/seedbank/accessions/{accessionId}/viabilityTests';

type GetAccessionHistoryResponsePayload =
  paths[typeof ACCESSION_HISTORY_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type AccessionHistory = GetAccessionHistoryResponsePayload['history'];

export type AccessionHistoryEntry = Required<AccessionHistory>[0];

export type ViabilityTestPostRequest =
  paths[typeof VIABILITY_TESTS_ENDPOINT]['post']['requestBody']['content']['application/json'];

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
  getTransitionToStates,
  getParsedCoords,
};

export default AccessionService;
