import area from '@turf/area';
import { MultiPolygon, Position } from 'geojson';

import { MapBounds, MapLabelPlacement, MapPoint } from './types';

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

const getSegmentDistanceSquared = (x: number, y: number, start: Position, end: Position): number => {
  let closestX = start[0];
  let closestY = start[1];
  let deltaX = end[0] - closestX;
  let deltaY = end[1] - closestY;

  if (deltaX !== 0 || deltaY !== 0) {
    const projection = ((x - closestX) * deltaX + (y - closestY) * deltaY) / (deltaX * deltaX + deltaY * deltaY);
    if (projection > 1) {
      closestX = end[0];
      closestY = end[1];
    } else if (projection > 0) {
      closestX += deltaX * projection;
      closestY += deltaY * projection;
    }
  }

  deltaX = x - closestX;
  deltaY = y - closestY;
  return deltaX * deltaX + deltaY * deltaY;
};

/**
 * Distance from a point to the closest edge of a polygon, negative when the point is outside it.
 * Holes count as edges, so a point in a hole is correctly reported as outside.
 */
const getPointToPolygonDistance = (x: number, y: number, rings: Position[][]): number => {
  let inside = false;
  let minDistanceSquared = Infinity;

  for (const ring of rings) {
    for (let i = 0, previous = ring.length - 1; i < ring.length; previous = i++) {
      const current = ring[i];
      const last = ring[previous];
      if (
        current[1] > y !== last[1] > y &&
        x < ((last[0] - current[0]) * (y - current[1])) / (last[1] - current[1]) + current[0]
      ) {
        inside = !inside;
      }
      minDistanceSquared = Math.min(minDistanceSquared, getSegmentDistanceSquared(x, y, current, last));
    }
  }

  return (inside ? 1 : -1) * Math.sqrt(minDistanceSquared);
};

const MAX_LABEL_CELLS_PER_AXIS = 32;

type LabelCell = { x: number; y: number; halfSize: number; distance: number; maxDistance: number };

const createLabelCell = (x: number, y: number, halfSize: number, rings: Position[][]): LabelCell => {
  const distance = getPointToPolygonDistance(x, y, rings);
  return { x, y, halfSize, distance, maxDistance: distance + halfSize * Math.SQRT2 };
};

/**
 * Pole of inaccessibility: the interior point furthest from any edge, found by subdividing the
 * polygon's bounding box and always refining the cell that could still hold a better point. Unlike
 * a centroid it is guaranteed to be inside the polygon, so labels stay on crescent-shaped and
 * otherwise concave boundaries instead of drifting into the gap.
 */
const getPoleOfInaccessibility = (rings: Position[][]): MapPoint | undefined => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [x, y] of rings[0]) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      continue;
    }
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  const width = maxX - minX;
  const height = maxY - minY;
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return undefined;
  }

  const centerX = minX + width / 2;
  const centerY = minY + height / 2;
  // The grid is square cells as wide as the polygon's shorter side, except for slivers: a boundary
  // a thousand times longer than it is wide would otherwise ask for a million starting cells.
  const cellSize = Math.max(Math.min(width, height), Math.max(width, height) / MAX_LABEL_CELLS_PER_AXIS);
  if (cellSize === 0) {
    return { lat: centerY, lng: centerX };
  }

  const queue: LabelCell[] = [];
  const initialHalfSize = cellSize / 2;
  for (let x = minX; x < maxX; x += cellSize) {
    for (let y = minY; y < maxY; y += cellSize) {
      queue.push(createLabelCell(x + initialHalfSize, y + initialHalfSize, initialHalfSize, rings));
    }
  }

  let best = createLabelCell(centerX, centerY, 0, rings);
  // Stop refining once no cell can beat the best point by more than half a percent of the extent;
  // finer than that makes no visible difference to where a label sits.
  const precision = Math.max(width, height) / 200;

  while (queue.length) {
    let bestIndex = 0;
    for (let i = 1; i < queue.length; i++) {
      if (queue[i].maxDistance > queue[bestIndex].maxDistance) {
        bestIndex = i;
      }
    }
    const cell = queue[bestIndex];
    queue[bestIndex] = queue[queue.length - 1];
    queue.pop();

    if (cell.distance > best.distance) {
      best = cell;
    }
    if (cell.maxDistance - best.distance <= precision) {
      continue;
    }

    const halfSize = cell.halfSize / 2;
    queue.push(createLabelCell(cell.x - halfSize, cell.y - halfSize, halfSize, rings));
    queue.push(createLabelCell(cell.x + halfSize, cell.y - halfSize, halfSize, rings));
    queue.push(createLabelCell(cell.x - halfSize, cell.y + halfSize, halfSize, rings));
    queue.push(createLabelCell(cell.x + halfSize, cell.y + halfSize, halfSize, rings));
  }

  return { lat: best.y, lng: best.x };
};

// Placements are keyed on the coordinate array the caller passed in, which for boundaries coming
// from the API is a stable reference. Callers rebuild their feature lists on every selection or
// hover change, and without this each of those renders would re-solve every polygon.
const labelPlacements = new WeakMap<Position[][][], MapLabelPlacement | undefined>();

/**
 * Where to put the single label for a multipolygon: inside its largest part, so a feature split
 * into many slivers gets one label on the part the user is most likely looking at.
 */
const getLabelPlacement = (coordinates: Position[][][]): MapLabelPlacement | undefined => {
  if (labelPlacements.has(coordinates)) {
    return labelPlacements.get(coordinates);
  }

  const placement = solveLabelPlacement(coordinates);
  labelPlacements.set(coordinates, placement);
  return placement;
};

const solveLabelPlacement = (coordinates: Position[][][]): MapLabelPlacement | undefined => {
  let largestRings: Position[][] | undefined;
  let largestArea = -Infinity;

  for (const polygon of coordinates) {
    if (!polygon.length || polygon[0].length < 3) {
      continue;
    }
    const polygonArea = area({ type: 'Polygon', coordinates: polygon });
    if (polygonArea > largestArea) {
      largestArea = polygonArea;
      largestRings = polygon;
    }
  }

  if (!largestRings) {
    return undefined;
  }

  const point = getPoleOfInaccessibility(largestRings);
  return point ? { ...point, area: largestArea } : undefined;
};

export {
  isBoundsValid,
  getBoundingBoxFromMultiPolygons,
  getBoundingBoxFromPoints,
  getBoundsZoomLevel,
  getLabelPlacement,
};
