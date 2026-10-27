import area from '@turf/area';
import difference from '@turf/difference';
import { feature as turfFeature, featureCollection as turfFeatureCollection } from '@turf/helpers';
import intersect from '@turf/intersect';
import union from '@turf/union';
import { Feature, MultiPolygon, Position } from 'geojson';

import { toMultiPolygon } from 'src/components/Map/utils';
import strings from 'src/strings';
import { GeometryFeature } from 'src/types/Map';
import { MinimalStratum } from 'src/types/Tracking';

import { defaultStratumPayload, stratumNameGenerator, substratumNameGenerator } from './utils';

type Bounded = { boundary: MultiPolygon };

// anything smaller is a sliver left behind by floating point error
const MIN_AREA_SQ_M = 1;
const ON_LINE_TOLERANCE = 1e-7;
// in squared degrees; real corners are many orders of magnitude larger
const DEGENERATE_CORNER_TOLERANCE = 1e-14;

const isDegenerateCorner = (previous: Position, position: Position, next: Position): boolean =>
  Math.abs(
    (position[0] - previous[0]) * (next[1] - previous[1]) - (position[1] - previous[1]) * (next[0] - previous[0])
  ) <= DEGENERATE_CORNER_TOLERANCE;

// polygon operations can leave zero-width spikes where edges double back on themselves, which the server
// rejects as self-intersections, so drop corners that don't turn
const withoutDegenerateCorners = (geometry: MultiPolygon): MultiPolygon => {
  const cleanRing = (polygonRing: Position[]): Position[] | undefined => {
    const positions = polygonRing.slice(0, -1);
    let removed = true;
    while (removed && positions.length >= 3) {
      removed = false;
      for (let index = 0; index < positions.length; index++) {
        const previous = positions[(index - 1 + positions.length) % positions.length];
        const next = positions[(index + 1) % positions.length];
        if (isDegenerateCorner(previous, positions[index], next)) {
          positions.splice(index, 1);
          removed = true;
          break;
        }
      }
    }
    return positions.length >= 3 ? [...positions, positions[0]] : undefined;
  };

  return {
    type: 'MultiPolygon',
    coordinates: geometry.coordinates.flatMap((polygon) => {
      const [outer, ...holes] = polygon.map(cleanRing);
      return outer ? [[outer, ...holes.filter((hole): hole is Position[] => !!hole)]] : [];
    }),
  };
};

const intersectionOf = (a: MultiPolygon, b: MultiPolygon): MultiPolygon | undefined => {
  const result = intersect(turfFeatureCollection([turfFeature(a), turfFeature(b)]));
  const multiPolygon = result ? toMultiPolygon(result.geometry) : null;
  return multiPolygon && area(multiPolygon) >= MIN_AREA_SQ_M ? multiPolygon : undefined;
};

const unionOf = (geometries: MultiPolygon[]): MultiPolygon | undefined => {
  if (geometries.length < 2) {
    return geometries[0];
  }
  const result = union(turfFeatureCollection(geometries.map((geometry) => turfFeature(geometry))));
  return (result && toMultiPolygon(result.geometry)) || undefined;
};

const differenceOf = (a: MultiPolygon, b?: MultiPolygon): MultiPolygon | undefined => {
  if (!b) {
    return a;
  }
  const result = difference(turfFeatureCollection([turfFeature(a), turfFeature(b)]));
  return (result && toMultiPolygon(result.geometry)) || undefined;
};

type Segment = [Position, Position];

// longitude is scaled by the cosine of the latitude so distances are roughly the same in both directions
const toPlanar = (latitude: number) => {
  const scale = Math.cos((latitude * Math.PI) / 180);
  return ([x, y]: Position): Position => [x * scale, y];
};

const segmentsOf = (geometry: MultiPolygon, planar: (position: Position) => Position): Segment[] =>
  geometry.coordinates.flatMap((polygon) =>
    polygon.flatMap((polygonRing) =>
      polygonRing.slice(1).map((position, index): Segment => [planar(polygonRing[index]), planar(position)])
    )
  );

const lengthOf = ([[x1, y1], [x2, y2]]: Segment) => Math.hypot(x2 - x1, y2 - y1);

const projection = ([x, y]: Position, [[x1, y1], [x2, y2]]: Segment): number => {
  const lengthSquared = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  return lengthSquared === 0 ? 0 : ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / lengthSquared;
};

const distanceToSegment = (point: Position, segment: Segment): number => {
  const t = Math.min(1, Math.max(0, projection(point, segment)));
  const [[x1, y1], [x2, y2]] = segment;
  return Math.hypot(point[0] - (x1 + t * (x2 - x1)), point[1] - (y1 + t * (y2 - y1)));
};

const distanceToLine = (point: Position, segment: Segment): number => {
  const t = projection(point, segment);
  const [[x1, y1], [x2, y2]] = segment;
  return Math.hypot(point[0] - (x1 + t * (x2 - x1)), point[1] - (y1 + t * (y2 - y1)));
};

// length of the part of segment a that runs along segment b
const overlapLength = (a: Segment, b: Segment): number => {
  if (distanceToLine(b[0], a) > ON_LINE_TOLERANCE || distanceToLine(b[1], a) > ON_LINE_TOLERANCE) {
    return 0;
  }
  const t1 = projection(b[0], a);
  const t2 = projection(b[1], a);
  const overlap = Math.min(1, Math.max(t1, t2)) - Math.max(0, Math.min(t1, t2));
  return overlap > 0 ? overlap * lengthOf(a) : 0;
};

type Bounds = { maxX: number; maxY: number; minX: number; minY: number };

const boundsOf = (segments: Segment[]): Bounds =>
  segments.reduce(
    (bounds, [[x1, y1], [x2, y2]]) => ({
      maxX: Math.max(bounds.maxX, x1, x2),
      maxY: Math.max(bounds.maxY, y1, y2),
      minX: Math.min(bounds.minX, x1, x2),
      minY: Math.min(bounds.minY, y1, y2),
    }),
    { maxX: -Infinity, maxY: -Infinity, minX: Infinity, minY: Infinity }
  );

const isNear = ([[x1, y1], [x2, y2]]: Segment, bounds: Bounds): boolean =>
  Math.max(x1, x2) >= bounds.minX - ON_LINE_TOLERANCE &&
  Math.min(x1, x2) <= bounds.maxX + ON_LINE_TOLERANCE &&
  Math.max(y1, y2) >= bounds.minY - ON_LINE_TOLERANCE &&
  Math.min(y1, y2) <= bounds.maxY + ON_LINE_TOLERANCE;

const sharedBorderLength = (pieceSegments: Segment[], childSegments: Segment[]): number => {
  const pieceBounds = boundsOf(pieceSegments);
  const nearbySegments = childSegments.filter((segment) => isNear(segment, pieceBounds));

  return pieceSegments.reduce(
    (total, pieceSegment) =>
      total + nearbySegments.reduce((sum, childSegment) => sum + overlapLength(pieceSegment, childSegment), 0),
    0
  );
};

// shapes can have thousands of vertices, too many to spread into Math.min
const minDistanceFromPoints = (pointSegments: Segment[], segments: Segment[]): number =>
  pointSegments.reduce(
    (min, [point]) => segments.reduce((closest, segment) => Math.min(closest, distanceToSegment(point, segment)), min),
    Infinity
  );

const distanceBetween = (aSegments: Segment[], bSegments: Segment[]): number =>
  Math.min(minDistanceFromPoints(aSegments, bSegments), minDistanceFromPoints(bSegments, aSegments));

const targetIndexFor = (piece: MultiPolygon, children: Bounded[]): number => {
  const planar = toPlanar(piece.coordinates[0][0][0][1]);
  const pieceSegments = segmentsOf(piece, planar);
  const childSegments = children.map((child) => segmentsOf(child.boundary, planar));

  const borders = childSegments.map((segments) => sharedBorderLength(pieceSegments, segments));
  const longestBorder = Math.max(...borders);
  if (longestBorder > 0) {
    return borders.indexOf(longestBorder);
  }

  const distances = childSegments.map((segments) => distanceBetween(pieceSegments, segments));
  return distances.indexOf(Math.min(...distances));
};

/**
 * Fit child boundaries (strata of a site, or substrata of a stratum) to a changed parent boundary. Children are
 * clipped to the boundary and dropped if nothing remains; area the boundary gained goes to the child that shares the
 * longest border with it, or to the nearest child.
 */
export const reconcileToBoundary = <T extends Bounded>(children: T[], boundary: MultiPolygon): T[] => {
  const clipped = children
    .map((child) => {
      const clippedBoundary = intersectionOf(child.boundary, boundary);
      if (!clippedBoundary) {
        return undefined;
      }
      const unchanged = Math.abs(area(clippedBoundary) - area(child.boundary)) < MIN_AREA_SQ_M;
      return unchanged ? child : { ...child, boundary: withoutDegenerateCorners(clippedBoundary) };
    })
    .filter((child): child is T => !!child);

  if (!clipped.length) {
    return [];
  }

  const added = differenceOf(boundary, unionOf(clipped.map((child) => child.boundary)));
  const pieces = (added?.coordinates ?? [])
    .map((coordinates): MultiPolygon => ({ type: 'MultiPolygon', coordinates: [coordinates] }))
    .filter((piece) => area(piece) >= MIN_AREA_SQ_M);

  return pieces.reduce((result, piece) => {
    const targetIndex = targetIndexFor(piece, result);
    return result.map((child, index) =>
      index === targetIndex
        ? { ...child, boundary: withoutDegenerateCorners(unionOf([child.boundary, piece]) ?? child.boundary) }
        : child
    );
  }, clipped);
};

export const reconcileStratumSubstrata = (stratum: MinimalStratum, nextKey: () => number): MinimalStratum => {
  const substrata = reconcileToBoundary(stratum.substrata, stratum.boundary);
  if (substrata.length) {
    return { ...stratum, substrata };
  }

  const name = substratumNameGenerator(new Set(), strings.SUBSTRATUM);
  return {
    ...stratum,
    substrata: [{ boundary: stratum.boundary, fullName: name, id: nextKey(), name, plantingCompleted: false }],
  };
};

export const reconcileStrata = (
  strata: MinimalStratum[],
  boundary: MultiPolygon,
  nextStratumKey: () => number,
  nextSubstratumKey: () => number
): MinimalStratum[] => {
  const reconciled = reconcileToBoundary(strata, boundary);
  if (!reconciled.length) {
    return [
      defaultStratumPayload({
        boundary,
        id: nextStratumKey(),
        initialPlantingDensity: 1500,
        name: stratumNameGenerator(new Set(), strings.STRATUM),
      }),
    ];
  }

  return reconciled.map((stratum) => reconcileStratumSubstrata(stratum, nextSubstratumKey));
};

/**
 * Generates local keys for strata and substrata created while editing an existing site. They count down from below
 * zero so they can never match the id of a stratum or substratum on the server. They also skip -1, which toFeature
 * treats as the placeholder id of an unsaved site.
 */
export const NegativeIdGenerator = (features: Feature[], reservedIds: number[] = []): (() => number) => {
  let nextId = [...features.map((feature) => Number(feature.id)), ...reservedIds]
    .filter((id) => !isNaN(id))
    .reduce((a, b) => Math.min(a, b), -1);

  return () => --nextId;
};

/**
 * When a cut splits one existing feature in two, let the larger piece keep the original feature's identity.
 */
export const keepIdOnLargerPiece = (before: GeometryFeature[], cut: GeometryFeature[]): GeometryFeature[] => {
  const changed = cut.filter((feature) => {
    if (feature.id === undefined) {
      return false;
    }
    const original = before.find((beforeFeature) => beforeFeature.id === feature.id);
    return JSON.stringify(original?.geometry) !== JSON.stringify(feature.geometry);
  });
  const added = cut.filter((feature) => feature.id === undefined);

  if (changed.length !== 1 || added.length !== 1) {
    return cut;
  }

  const [remainder] = changed;
  const [piece] = added;
  const originalFeature = before.find((beforeFeature) => beforeFeature.id === remainder.id)!;
  // the new piece may also cover features the cut removed entirely, which don't count toward its size
  const takenFromOriginal = intersectionOf(
    toMultiPolygon(piece.geometry) as MultiPolygon,
    toMultiPolygon(originalFeature.geometry) as MultiPolygon
  );
  if (!takenFromOriginal || area(takenFromOriginal) <= area(remainder)) {
    return cut;
  }

  return cut.map((feature) => {
    if (feature === remainder) {
      return { ...remainder, geometry: piece.geometry };
    }
    if (feature === piece) {
      return { ...piece, geometry: remainder.geometry };
    }
    return feature;
  });
};
