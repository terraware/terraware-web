import { useCallback, useEffect, useState } from 'react';
import { Feature, Geometry, MultiPolygon } from 'geojson';
import { MapRef, useControl } from 'react-map-gl';
import { GeolocateControl, ScaleControl } from 'mapbox-gl';
import MapboxDraw, {
  DrawCreateEvent,
  DrawMode,
  DrawModeChangeEvent,
  DrawSelectionChangeEvent,
  DrawUpdateEvent,
} from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

/**
 * Flattened representation of the editor's current state. This is based on a combination of factors
 * such as the draw mode, the presence of an existing boundary, and the currently-selected feature.
 * Not all possible permutations of those factors are represented as unique modes, just ones that
 * can cause user-visible behavior differences.
 */
export type MapEditorMode =
  | 'BoundaryNotSelected'
  | 'BoundarySelected'
  | 'CreatingBoundary'
  | 'EditingBoundary'
  | 'NoBoundary'
  | 'ReplacingBoundary';

type MapEditorProps = ConstructorParameters<typeof MapboxDraw>[0] & {
  boundary?: MultiPolygon;
  onBoundaryChanged?: (boundary: MultiPolygon | null) => void;
  setMode?: (mode: MapEditorMode) => void;
};

const defaultProps = {
  controls: {
    polygon: true,
    trash: true,
  },
  displayControlsDefault: false,
};

/**
 * Detects whether or not a map feature has any coordinates. This is used to distinguish a real
 * map boundary from the default 0-vertex polygon the draw control adds to the map by default.
 */
function featureHasCoordinates(feature: Feature | undefined): boolean {
  if (!feature || !feature.geometry) {
    return false;
  }

  const geometry = feature.geometry;

  if (geometry.type === 'MultiPolygon') {
    // There is no way to add a MultiPolygon using the editor, so this must be a geometry that
    // was supplied by the parent component.
    return true;
  }

  if (geometry.type === 'Polygon') {
    // The default polygon's coordinates are [[null]].
    return !!(geometry.coordinates && geometry.coordinates[0] && geometry.coordinates[0][0]);
  }

  return false;
}

function toMultiPolygon(geometry: Geometry): MultiPolygon | null {
  if (geometry.type === 'MultiPolygon') {
    return geometry;
  } else if (geometry.type === 'Polygon') {
    return { type: 'MultiPolygon', coordinates: [geometry.coordinates] };
  } else {
    return null;
  }
}

/**
 * Makes a parent ReactMapGL component editable. This is a wrapper around the MapboxDraw control.
 * The editor supports drawing a boundary consisting of a single polygon.
 *
 * @param boundary
 *  Initial boundary. If this is specified, the editor will start out in EditingBoundary mode;
 *  otherwise it will start out in CreatingBoundary mode.
 * @param onBoundaryChanged
 *  Called when the user adds, edits, or deletes the boundary. The boundary is always a
 *  MultiPolygon containing a single polygon.
 * @param setMode
 * @param otherProps
 *  Additional properties to pass to the MapboxDraw control.
 */
export default function EditableMapDraw({ boundary, onBoundaryChanged, setMode, ...otherProps }: MapEditorProps) {
  const [mapRef, setMapRef] = useState<MapRef>();
  const [drawMode, setDrawMode] = useState<DrawMode>();
  const [selection, setSelection] = useState<Feature>();
  const [initializedGeometry, setInitializedGeometry] = useState(false);

  const onModeChange = (event: DrawModeChangeEvent) => setDrawMode(event.mode);
  const onSelectionChange = (event: DrawSelectionChangeEvent) => {
    if (event.features) {
      setSelection(event.features[0]);
    } else {
      setSelection(undefined);
    }
  };

  const onCreate = (event: DrawCreateEvent) =>
    onBoundaryChanged && onBoundaryChanged(toMultiPolygon(event.features[0].geometry));
  const onDelete = () => onBoundaryChanged && onBoundaryChanged(null);
  const onUpdate = (event: DrawUpdateEvent) =>
    onBoundaryChanged && onBoundaryChanged(toMultiPolygon(event.features[0].geometry));

  // Need ts-ignore because the draw control's event types are added by the draw plugin and aren't
  // included in the type definitions for the first arguments of MapRef.on() and MapRef.off().
  const draw = useControl<MapboxDraw>(
    ({ map }) => {
      // @ts-ignore
      map.on('draw.create', onCreate);
      // @ts-ignore
      map.on('draw.delete', onDelete);
      // @ts-ignore
      map.on('draw.modechange', onModeChange);
      // @ts-ignore
      map.on('draw.selectionchange', onSelectionChange);
      // @ts-ignore
      map.on('draw.update', onUpdate);

      const initialMode = boundary ? 'simple_select' : 'draw_polygon';

      setDrawMode(initialMode);
      setMapRef(map);

      return new MapboxDraw({ defaultMode: initialMode, ...defaultProps, ...otherProps });
    },
    ({ map }) => {
      // @ts-ignore
      map.off('draw.create', onCreate);
      // @ts-ignore
      map.off('draw.delete', onDelete);
      // @ts-ignore
      map.off('draw.modechange', onModeChange);
      // @ts-ignore
      map.off('draw.update', onUpdate);
    }
  );

  useEffect(() => {
    if (setMode && initializedGeometry) {
      const features = draw.getAll().features;
      const hasFeature = features && featureHasCoordinates(features[0]);

      if (drawMode === 'draw_polygon') {
        if (hasFeature) {
          setMode('ReplacingBoundary');
        } else {
          setMode('CreatingBoundary');
        }
      } else if (drawMode === 'simple_select') {
        if (selection) {
          setMode('BoundarySelected');
        } else if (hasFeature) {
          setMode('BoundaryNotSelected');
        } else {
          setMode('NoBoundary');
        }
      } else if (drawMode === 'direct_select') {
        if (selection) {
          setMode('EditingBoundary');
        } else {
          setMode('BoundaryNotSelected');
        }
      }
    }
  }, [draw, drawMode, initializedGeometry, selection, setMode]);

  const removeExistingPolygon = useCallback(() => {
    // We only allow one polygon on the map; if there's an existing one, delete it.
    const features = draw.getAll().features;
    if (features.length > 1) {
      draw.delete(`${features[0].id}`);
    }
  }, [draw]);

  const switchToPolygonModeIfFeatureDeleted = useCallback(() => {
    const features = draw.getAll().features;
    if (features.length === 0) {
      draw.changeMode('draw_polygon');
      setDrawMode('draw_polygon');
    }
  }, [draw]);

  const populateGeometry = useCallback(() => {
    if (!initializedGeometry) {
      if (boundary) {
        const featureIds = draw.add(boundary);
        draw.changeMode('direct_select', { featureId: featureIds[0] });
        setDrawMode('direct_select');
      }

      setInitializedGeometry(true);
    }
  }, [draw, boundary, initializedGeometry, setDrawMode, setInitializedGeometry]);

  useEffect(() => {
    if (mapRef?.loaded()) {
      populateGeometry();
    } else {
      mapRef?.on('load', populateGeometry);
    }

    mapRef?.on('draw.create', removeExistingPolygon);
    mapRef?.on('draw.delete', switchToPolygonModeIfFeatureDeleted);
  }, [mapRef, populateGeometry, removeExistingPolygon, switchToPolygonModeIfFeatureDeleted]);

  useControl<GeolocateControl>(
    () =>
      new GeolocateControl({
        fitBoundsOptions: {
          maxDuration: 1500,
        },
        positionOptions: {
          enableHighAccuracy: true,
        },
      })
  );

  useControl<ScaleControl>(() => new ScaleControl());

  return null;
}
