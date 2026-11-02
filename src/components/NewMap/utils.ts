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

const getLongitudeBounds = (intervals: [number, number][]): { minLng: number; maxLng: number } => {
  if (intervals.length === 0) {
    return { minLng: Infinity, maxLng: -Infinity };
  }

  intervals.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [west, east] of intervals) {
    const previous = merged[merged.length - 1];
    if (previous && west <= previous[1]) {
      previous[1] = Math.max(previous[1], east);
    } else {
      merged.push([west, east]);
    }
  }

  let minLng = merged[0][0];
  let maxLng = merged[merged.length - 1][1];
  let largestGap = minLng + 360 - maxLng;
  for (let i = 1; i < merged.length; i++) {
    const gap = merged[i][0] - merged[i - 1][1];
    if (gap > largestGap) {
      largestGap = gap;
      minLng = merged[i][0];
      maxLng = merged[i - 1][1] + 360;
    }
  }
  return { minLng, maxLng };
};

const getBoundingBoxFromMultiPolygons = (multipolygons: MultiPolygon[]): MapBounds => {
  let minLat = Infinity;
  let maxLat = -Infinity;
  const intervals: [number, number][] = [];
  for (const multipolygon of multipolygons) {
    for (const polygon of multipolygon.coordinates) {
      let west = Infinity;
      let east = -Infinity;
      for (const ring of polygon) {
        for (const [lng, lat] of ring) {
          if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
            continue;
          }
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
          west = Math.min(west, lng);
          east = Math.max(east, lng);
        }
      }
      if (Number.isFinite(west)) {
        intervals.push([west, east]);
      }
    }
  }
  return { minLat, maxLat, ...getLongitudeBounds(intervals) };
};

const getBoundingBoxFromPoints = (points: MapPoint[]): MapBounds => {
  let minLat = Infinity;
  let maxLat = -Infinity;
  const intervals: [number, number][] = [];
  for (const { lng, lat } of points) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      continue;
    }
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    intervals.push([lng, lng]);
  }

  return { minLat, maxLat, ...getLongitudeBounds(intervals) };
};

export { isBoundsValid, getBoundingBoxFromMultiPolygons, getBoundingBoxFromPoints, getBoundsZoomLevel };
