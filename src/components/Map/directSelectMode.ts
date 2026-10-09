import MapboxDraw, { DrawCustomMode, DrawCustomModeThis, DrawFeature } from '@mapbox/mapbox-gl-draw';
import { Position } from 'geojson';

type DirectSelectState = {
  feature: DrawFeature;
  featureId: string;
  selectedCoordPaths: string[];
};

type DirectSelectMode = DrawCustomMode<DirectSelectState> & {
  fireActionable(this: DrawCustomModeThis & DirectSelectMode, state: DirectSelectState): void;
  fireUpdate(this: DrawCustomModeThis & DirectSelectMode): void;
};

const baseDirectSelect = MapboxDraw.modes.direct_select as DirectSelectMode;

/**
 * Removes vertices from polygons whose rings are open (the first point isn't repeated at the end).
 * A hole that drops below three points is removed, and a polygon whose outer ring drops below three
 * points is removed along with its holes.
 *
 * @param polygons
 *  Each polygon's rings, outer ring first.
 * @param paths
 *  [polygon, ring, vertex] indexes of the vertices to remove.
 */
export const withoutVertices = (polygons: Position[][][], paths: number[][]): Position[][][] =>
  polygons
    .map((rings, polygonIndex) =>
      rings.map((ring, ringIndex) =>
        ring.filter(
          (_, vertexIndex) => !paths.some(([p, r, v]) => p === polygonIndex && r === ringIndex && v === vertexIndex)
        )
      )
    )
    .filter((rings) => rings[0]?.length >= 3)
    .map((rings) => rings.filter((ring) => ring.length >= 3));

const openRing = (ring: Position[]) => ring.slice(0, -1);

const closeRing = (ring: Position[]) => [...ring, ring[0]];

/**
 * The draw control's direct_select mode, except that removing vertices drops only the holes and
 * polygons left with fewer than three points. The stock mode turns a hole into the outer ring when the
 * outer ring gets too small, and deletes every part of a multipolygon when one part gets too small.
 */
export const directSelectMode: DirectSelectMode = {
  ...baseDirectSelect,

  onTrash(state) {
    const { feature } = state;
    if (feature.type !== 'Polygon' && feature.type !== 'MultiPolygon') {
      baseDirectSelect.onTrash?.call(this, state);
      return;
    }

    const isPolygon = feature.type === 'Polygon';
    const polygons = isPolygon ? [feature.getCoordinates()] : feature.getCoordinates();
    const paths = state.selectedCoordPaths.map((path) => {
      const indexes = path.split('.').map(Number);
      return isPolygon ? [0, ...indexes] : indexes;
    });
    const remaining = withoutVertices(
      polygons.map((rings) => rings.map(openRing)),
      paths
    );

    state.selectedCoordPaths = [];
    this.clearSelectedCoordinates();

    if (!remaining.length) {
      // leave this mode before deleting so that listeners reacting to the deletion can switch modes
      this.changeMode('simple_select');
      this.deleteFeature(state.featureId);
      return;
    }

    if (isPolygon) {
      // a polygon's own setter takes open rings
      feature.setCoordinates(remaining[0]);
    } else {
      // a multipolygon's setter builds its parts from GeoJSON, so the rings must be closed
      feature.setCoordinates(remaining.map((rings) => rings.map(closeRing)));
    }
    this.fireUpdate();
    this.fireActionable(state);
  },
};
