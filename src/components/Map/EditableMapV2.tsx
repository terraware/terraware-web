import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMapGL, {
  FullscreenControl,
  GeolocateControl,
  Layer,
  LngLatBoundsLike,
  MapRef,
  NavigationControl,
  Source,
} from 'react-map-gl';
import EditableMapDraw, { MapEditorMode } from 'src/components/Map/EditableMapDrawV2';
import useMapboxToken from 'src/utils/useMapboxToken';
import { Box, useTheme } from '@mui/material';
import { useIsVisible } from 'src/hooks/useIsVisible';
import bbox from '@turf/bbox';
import { FeatureCollection, MultiPolygon } from 'geojson';
import { MapSourceRenderProperties, MapViewStyles } from 'src/types/Map';
import { getMapDrawingLayer, toMultiPolygon } from './utils';
import MapViewStyleControl, { useMapViewStyle } from './MapViewStyleControl';
import { ReadOnlyBoundary } from './types';
import UndoRedoBoundaryControl from './UndoRedoBoundaryControl';

export type RenderableReadOnlyBoundary = ReadOnlyBoundary & {
  renderProperties: MapSourceRenderProperties;
};

export type EditableMapProps = {
  allowEditMultiplePolygons?: boolean;
  clearOnEdit?: boolean;
  editableBoundary?: FeatureCollection;
  onEditableBoundaryChanged: (boundary?: FeatureCollection, isUndoRedo?: boolean) => void;
  onUndoRedoReadOnlyBoundary?: (readOnlyBoundary?: ReadOnlyBoundary[]) => void;
  setMode?: (mode: MapEditorMode) => void;
  readOnlyBoundary?: RenderableReadOnlyBoundary[];
  style?: object;
};

export default function EditableMap({
  allowEditMultiplePolygons,
  clearOnEdit,
  editableBoundary,
  onEditableBoundaryChanged,
  onUndoRedoReadOnlyBoundary,
  readOnlyBoundary,
  setMode,
  style,
}: EditableMapProps): JSX.Element {
  const { mapId, refreshToken, token } = useMapboxToken();
  const [firstVisible, setFirstVisible] = useState<boolean>(false);
  const containerRef = useRef(null);
  const mapRef = useRef<MapRef | null>(null);
  const visible = useIsVisible(containerRef);
  const theme = useTheme();
  const [mapViewStyle, onChangeMapViewStyle] = useMapViewStyle();

  useEffect(() => {
    // `firstVisible` detects when the box containing the map is first visible in the viewport. The map should only be
    // rendered if `firstVisible` is true. This accounts for cases in which the map is initially rendered hidden, and
    // is improperly resized when it first becomes visible.
    setFirstVisible((fv) => fv || visible);
  }, [visible]);

  const onMapError = useCallback(
    (event: any) => {
      if (event?.error?.status === 401 && refreshToken) {
        refreshToken();
      }
    },
    [refreshToken]
  );

  const initialViewState = {
    bounds: readOnlyBoundary?.length
      ? (bbox({
          type: 'MultiPolygon',
          coordinates: readOnlyBoundary!
            .flatMap((b) => b.featureCollection.features)
            .flatMap((feature) => toMultiPolygon(feature.geometry))
            .filter((poly: MultiPolygon | null) => poly !== null)
            .flatMap((poly: MultiPolygon | null) => poly!.coordinates),
        }) as LngLatBoundsLike)
      : undefined,
    fitBoundsOptions: {
      animate: false,
      padding: 25,
    },
  };

  const undoRedoEditableBoundary = useCallback(
    (data?: FeatureCollection) => void onEditableBoundaryChanged(data, true),
    [onEditableBoundaryChanged]
  );

  const undoRedoReadOnlyBoundary = useCallback(
    (data?: ReadOnlyBoundary[]) => {
      if (onUndoRedoReadOnlyBoundary) {
        void onUndoRedoReadOnlyBoundary(data);
      }
    },
    [onUndoRedoReadOnlyBoundary]
  );

  const mapLayers = useMemo(() => {
    if (!readOnlyBoundary?.length) {
      return null;
    }
    return readOnlyBoundary!.map((data: RenderableReadOnlyBoundary) => {
      const drawingLayer: any = getMapDrawingLayer(data.renderProperties, data.id);
      return (
        <Source type='geojson' key={data.id} data={data.featureCollection} id={data.id}>
          {drawingLayer.patternFill && <Layer {...drawingLayer.patternFill} />}
          {drawingLayer.textAnnotation && <Layer {...drawingLayer.textAnnotation} />}
          {drawingLayer.layerOutline && <Layer {...drawingLayer.layerOutline} />}
          {drawingLayer.layer && <Layer {...drawingLayer.layer} />}
        </Source>
      );
    });
  }, [readOnlyBoundary]);

  return (
    <Box
      ref={containerRef}
      display='flex'
      flexDirection='column'
      flexGrow={1}
      height='100%'
      width='100%'
      sx={{
        minHeight: 250,
        position: 'relative',
        '& .mapboxgl-map': {
          borderRadius: theme.spacing(2),
        },
      }}
    >
      {firstVisible && (
        <>
          <ReactMapGL
            key={mapId}
            onError={onMapError}
            ref={mapRef}
            mapboxAccessToken={token}
            mapStyle={MapViewStyles[mapViewStyle]}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexGrow: '1',
              flexDirection: 'column',
              ...style,
            }}
            initialViewState={initialViewState}
          >
            {mapLayers}
            <FullscreenControl position='top-left' />
            <MapViewStyleControl mapViewStyle={mapViewStyle} onChangeMapViewStyle={onChangeMapViewStyle} />
            <EditableMapDraw
              allowEditMultiplePolygons={allowEditMultiplePolygons}
              clearOnEdit={clearOnEdit}
              boundary={editableBoundary}
              onBoundaryChanged={onEditableBoundaryChanged}
              setMode={setMode}
            />
            <UndoRedoBoundaryControl
              editableBoundary={editableBoundary}
              onEditableBoundaryChanged={undoRedoEditableBoundary}
              onReadOnlyBoundaryChanged={undoRedoReadOnlyBoundary}
              readOnlyBoundary={readOnlyBoundary}
            />
            <NavigationControl position='bottom-right' showCompass={false} />
            <GeolocateControl
              position='bottom-right'
              fitBoundsOptions={{ maxDuration: 1500 }}
              positionOptions={{ enableHighAccuracy: true }}
            />
          </ReactMapGL>
        </>
      )}
    </Box>
  );
}
