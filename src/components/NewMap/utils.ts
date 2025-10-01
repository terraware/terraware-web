import { MultiPolygon } from 'geojson';

import { MapBounds } from './types';

const latToY = (lat: number): number => {
  const rad = (lat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
};

const isBoundsValid = (bounds: MapBounds) => {
  const { minLat, maxLat, minLng, maxLng } = bounds;

  // Latitude must be within [-90, 90] and min <= max
  const latValid = -90 <= minLat && minLat <= maxLat && maxLat <= 90;

  // Longitude must be within [-180, 180]; allow crossing antimeridian
  const lngValid = -180 <= minLng && minLng <= 180 && -180 <= maxLng && maxLng <= 180;

  return latValid && lngValid;
};

const getBoundsZoomLevel = (bounds: MapBounds, mapWidth: number, mapHeight: number): number => {
  const TILE_SIZE = 256;

  // Latitude fraction (north–south span)
  const latFraction = (latToY(bounds.maxLat) - latToY(bounds.minLat)) / (2 * Math.PI);

  // Longitude fraction (east–west span, handle wraparound)
  let lngDiff = bounds.maxLng - bounds.minLng;
  if (lngDiff < 0) {
    lngDiff += 360;
  }
  const lngFraction = lngDiff / 360;

  // Zoom levels required for height and width
  const latZoom = Math.log2(mapHeight / TILE_SIZE / latFraction);
  const lngZoom = Math.log2(mapWidth / TILE_SIZE / lngFraction);

  // Use the smaller zoom so the whole box fits
  return Math.floor(Math.min(latZoom, lngZoom));
};

const getBoundingBox = (multipolygons: MultiPolygon[]): MapBounds => {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  const coordinates = multipolygons
    .map((multipolygon) => multipolygon.coordinates)
    .flat()
    .flat()
    .flat();

  if (coordinates.length > 0) {
    for (const [lng, lat] of coordinates) {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    }
  }

  return { minLat, minLng, maxLat, maxLng };
};

export { isBoundsValid, getBoundingBox, getBoundsZoomLevel };
