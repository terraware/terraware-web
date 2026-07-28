// Geometry helpers for simplifying polygon boundaries, e.g. to fit within a Mapbox Static Images API request URL. A
// small map thumbnail needs almost none of the coordinate detail of a full boundary, so these utilities keep only the
// outer ring of each polygon, drop negligible sliver polygons, and decimate the remaining points to fit a budget while
// preserving the overall shape and extent (every significant polygon is kept).

export type Position = number[]; // [longitude, latitude]
export type Ring = Position[];
export type Polygon = Ring[]; // [outerRing, ...holes]
export type MultiPolygonCoordinates = Polygon[];

// Coordinate precision (~1m at 5 decimals) — plenty for a small thumbnail.
const COORD_DECIMALS = 5;
// Polygons smaller than this fraction of the largest polygon's area are treated as slivers/artifacts and dropped.
const MIN_POLYGON_AREA_FRACTION = 0.0004;
// A valid, non-degenerate ring needs at least this many points.
const MIN_POINTS_PER_RING = 4;

export const roundCoord = ([lng, lat]: Position): Position => [
  Number(lng.toFixed(COORD_DECIMALS)),
  Number(lat.toFixed(COORD_DECIMALS)),
];

// Shoelace formula. Units are squared degrees, which is meaningless as an absolute area but fine for comparing the
// relative sizes of rings.
export const ringArea = (ring: Ring): number => {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(area / 2);
};

export const dedupeConsecutive = (ring: Ring): Ring =>
  ring.filter((point, index) => index === 0 || point[0] !== ring[index - 1][0] || point[1] !== ring[index - 1][1]);

export const ensureClosed = (ring: Ring): Ring => {
  if (ring.length === 0) {
    return ring;
  }
  const first = ring[0];
  const last = ring[ring.length - 1];
  return first[0] === last[0] && first[1] === last[1] ? ring : [...ring, first];
};

// Decimate a ring down to at most maxPoints, round the coordinates, and close it. Returns null when the result is a
// degenerate ring (fewer than 4 points or zero area), which most consumers (e.g. the Mapbox Static API) reject.
export const cleanRing = (ring: Ring, maxPoints: number): Ring | null => {
  // Decimate over the distinct vertices, excluding the redundant closing vertex, so the budget is spent on real
  // corners (otherwise a small ring like a square can be sampled down to a degenerate shape) and the ring is re-closed
  // afterwards.
  const isClosed =
    ring.length > 1 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];
  const vertices = isClosed ? ring.slice(0, -1) : ring;

  const step = Math.max(1, Math.ceil(vertices.length / maxPoints));
  const sampled = vertices.filter((_, index) => index % step === 0).map(roundCoord);

  const closed = ensureClosed(dedupeConsecutive(sampled));
  if (closed.length < MIN_POINTS_PER_RING || ringArea(closed) === 0) {
    return null;
  }
  return closed;
};

/**
 * Reduce a MultiPolygon's coordinates to its significant outer rings within a total point budget.
 *
 * Every significant polygon is kept (so the overall shape/extent is preserved); the budget is spent by lowering the
 * points-per-polygon rather than by dropping polygons. Only when there are more polygons than the budget allows (at the
 * minimum points each) are the smallest ones dropped. Holes (inner rings) are discarded.
 */
export const simplifyToBudget = (
  coordinates: MultiPolygonCoordinates,
  pointBudget: number
): MultiPolygonCoordinates => {
  const withArea = coordinates
    .map((polygon) => polygon[0])
    .filter((ring): ring is Ring => !!ring && ring.length >= MIN_POINTS_PER_RING)
    .map((ring) => ({ ring, area: ringArea(ring) }))
    .filter(({ area }) => area > 0);
  if (withArea.length === 0) {
    return [];
  }

  const maxArea = Math.max(...withArea.map(({ area }) => area));
  const significant = withArea
    .filter(({ area }) => area >= maxArea * MIN_POLYGON_AREA_FRACTION)
    .sort((a, b) => b.area - a.area);

  const maxPolygons = Math.max(1, Math.floor(pointBudget / MIN_POINTS_PER_RING));
  const kept = significant.slice(0, maxPolygons);
  const pointsPerRing = Math.max(MIN_POINTS_PER_RING, Math.floor(pointBudget / kept.length));

  return kept
    .map(({ ring }) => cleanRing(ring, pointsPerRing))
    .filter((ring): ring is Ring => ring !== null)
    .map((ring) => [ring]);
};
