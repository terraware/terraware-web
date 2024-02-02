import { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { Feature, FeatureCollection } from 'geojson';
import { MapRef, useControl } from 'react-map-gl';
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
  boundary?: FeatureCollection;
  clearOnEdit?: boolean;
  onBoundaryChanged?: (boundary?: FeatureCollection) => void;
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

/**
 * Makes a parent ReactMapGL component editable. This is a wrapper around the MapboxDraw control.
 * The editor supports drawing one or more polygons.
 *
 * @param boundary
 *  Initial boundary. If this is specified, the editor will start out in EditingBoundary mode;
 *  otherwise it will start out in CreatingBoundary mode.
 * @param clearOnEdit
 *  Whether to clear the boundary in the editor after onChange callbacks are notified
 * @param onBoundaryChanged
 *  Called when the user adds, edits, or deletes the boundary. The boundary is always a
 *  MultiPolygon containing a single polygon.
 * @param setMode
 * @param otherProps
 *  Additional properties to pass to the MapboxDraw control.
 */
export default function EditableMapDraw({
  boundary,
  clearOnEdit,
  onBoundaryChanged,
  setMode,
  ...otherProps
}: MapEditorProps) {
  const [mapRef, setMapRef] = useState<MapRef>();
  const [drawMode, setDrawMode] = useState<DrawMode>();
  const [selection, setSelection] = useState<Feature>();
  const [initializedGeometry, setInitializedGeometry] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);

  // Need ts-ignore because the draw control's event types are added by the draw plugin and aren't
  // included in the type definitions for the first arguments of MapRef.on() and MapRef.off().
  const draw = useControl<MapboxDraw>(({ map }) => {
    const initialMode = 'simple_select';

    setDrawMode(initialMode);
    setMapRef(map);

    return new MapboxDraw({ defaultMode: initialMode, ...defaultProps, ...otherProps });
  });

  const onModeChange = useCallback((event: DrawModeChangeEvent) => setDrawMode(event.mode), [setDrawMode]);

  const onSelectionChange = useCallback(
    (event: DrawSelectionChangeEvent) => {
      if (event.features) {
        setSelection(event.features[0]);
      } else {
        setSelection(undefined);
      }
    },
    [setSelection]
  );

  const fetchUpdatedFeatures = useCallback(
    (newFeatures: Feature[]): FeatureCollection | undefined => {
      const existingFeatures = draw
        .getAll()
        .features.filter(
          (currentFeature: Feature) => !newFeatures.some((newFeature: Feature) => newFeature.id === currentFeature.id)
        );

      const features = [...existingFeatures, ...newFeatures];
      return features.length ? { type: 'FeatureCollection', features } : undefined;
    },
    [draw]
  );

  const updateNotification = useCallback(
    (features: Feature[]) => {
      if (!onBoundaryChanged) {
        return;
      }

      const updatedFeatures = fetchUpdatedFeatures(features);
      onBoundaryChanged(updatedFeatures);
      if (clearOnEdit) {
        draw.deleteAll();
      }
    },
    [clearOnEdit, draw, fetchUpdatedFeatures, onBoundaryChanged]
  );

  const onCreate = useCallback(
    (event: DrawCreateEvent) => void updateNotification(event.features),
    [updateNotification]
  );

  const onUpdate = useCallback(
    (event: DrawUpdateEvent) => void updateNotification(event.features),
    [updateNotification]
  );

  const onDelete = useCallback(() => onBoundaryChanged && onBoundaryChanged(undefined), [onBoundaryChanged]);

  useEffect(() => {
    mapRef?.on('draw.create', onCreate);
    mapRef?.on('draw.delete', onDelete);
    mapRef?.on('draw.modechange', onModeChange);
    mapRef?.on('draw.selectionchange', onSelectionChange);
    mapRef?.on('draw.update', onUpdate);

    return () => {
      mapRef?.off('draw.create', onCreate);
      mapRef?.off('draw.delete', onDelete);
      mapRef?.off('draw.modechange', onModeChange);
      mapRef?.off('draw.selectionchange', onSelectionChange);
      mapRef?.off('draw.update', onUpdate);
    };
  }, [mapRef, onCreate, onDelete, onModeChange, onSelectionChange, onUpdate]);

  useEffect(() => {
    if (setMode && initializedGeometry) {
      const features = draw.getAll().features;
      const hasFeature = features && features.some((feature: Feature) => featureHasCoordinates(feature));
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

  const switchToPolygonModeIfFeatureDeleted = useCallback(() => {
    const features = draw.getAll().features;
    if (features.length === 0) {
      draw.changeMode('draw_polygon');
      setDrawMode('draw_polygon');
    }
  }, [draw]);

  const populateGeometry = useCallback(() => {
    const currentFeatureCollection = { type: 'FeatureCollection', features: draw.getAll().features };
    if (!boundary?.features.length) {
      if (draw.getAll().features.some((feature: Feature) => featureHasCoordinates(feature))) {
        draw.deleteAll();
      }
    } else if (!_.isEqual(currentFeatureCollection, boundary)) {
      draw.set(boundary);
    }

    if (!initializedGeometry) {
      setInitializedGeometry(true);
    }
  }, [draw, boundary, initializedGeometry, setInitializedGeometry]);

  useEffect(() => {
    if (mapRef?.loaded()) {
      setLoaded(true);
    } else {
      mapRef?.on('load', () => setLoaded(true));
    }

    mapRef?.on('draw.delete', switchToPolygonModeIfFeatureDeleted);
  }, [mapRef, switchToPolygonModeIfFeatureDeleted]);

  useEffect(() => {
    if (loaded) {
      populateGeometry();
    }
  }, [loaded, populateGeometry]);

  return null;
}
