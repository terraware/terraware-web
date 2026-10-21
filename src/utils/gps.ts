import Coordinates from 'coordinate-parser';

import { Geolocation } from 'src/types/Accession';

/**
 * Parses user-entered GPS coordinates, skipping any that are invalid.
 */
export const getParsedCoords = (coordsStr: string[]): Geolocation[] => {
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
        return null;
      }
    })
    .filter((coords) => coords !== null);
};
