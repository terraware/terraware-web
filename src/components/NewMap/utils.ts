import { MultiPolygon } from 'geojson';

import { MapBounds, MapPoint } from './types';

const MERCATOR_LAT_LIMIT = 85.0511287798;

const latToY = (lat: number): number => {
  const clampedLat = Math.max(-MERCATOR_LAT_LIMIT, Math.min(MERCATOR_LAT_LIMIT, lat));
  const rad = (clampedLat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
};

const isBoundsValid = (bounds: MapBounds) => {
  const { minLat, maxLat, minLng, maxLng } = bounds;

  if (![minLat, maxLat, minLng, maxLng].every(Number.isFinite)) {
    return false;
  }

  // Latitude must be within [-90, 90] and min <= max
  const latValid = -90 <= minLat && minLat <= maxLat && maxLat <= 90;

  // Allow wrapped and unwrapped antimeridian bounds.
  const lngValid =
    -180 <= minLng &&
    minLng <= 180 &&
    ((-180 <= maxLng && maxLng <= 180) || (minLng < maxLng && maxLng <= minLng + 360));

  return latValid && lngValid;
};

const getBoundsZoomLevel = (bounds: MapBounds, mapWidth: number, mapHeight: number): number => {
  if (
    !isBoundsValid(bounds) ||
    !Number.isFinite(mapWidth) ||
    !Number.isFinite(mapHeight) ||
    mapWidth <= 0 ||
    mapHeight <= 0
  ) {
    return 0;
  }

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
  return Math.max(0, Math.min(22, Math.floor(Math.min(latZoom, lngZoom))));
};

const getBoundingBoxFromMultiPolygons = (multipolygons: MultiPolygon[]): MapBounds => {
  const points = multipolygons
    .map((multipolygon) => multipolygon.coordinates)
    .flat()
    .flat()
    .flat()
    .map((coordinate) => ({ lng: coordinate[0], lat: coordinate[1] }));

  return getBoundingBoxFromPoints(points);
};

const getBoundingBoxFromPoints = (points: MapPoint[]): MapBounds => {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  const longitudes: number[] = [];
  for (const { lng, lat } of points) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      continue;
    }
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    longitudes.push(lng);
  }

  if (longitudes.length > 0) {
    longitudes.sort((a, b) => a - b);
    minLng = longitudes[0];
    maxLng = longitudes[longitudes.length - 1];
    let largestGap = minLng + 360 - maxLng;
    for (let i = 1; i < longitudes.length; i++) {
      const gap = longitudes[i] - longitudes[i - 1];
      if (gap > largestGap) {
        largestGap = gap;
        minLng = longitudes[i];
        maxLng = longitudes[i - 1] + 360;
      }
    }
  }

  return { minLat, minLng, maxLat, maxLng };
};

export { isBoundsValid, getBoundingBoxFromMultiPolygons, getBoundingBoxFromPoints, getBoundsZoomLevel };
