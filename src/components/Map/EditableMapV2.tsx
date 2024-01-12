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
import { FeatureCollection } from 'geojson';
import { MapSourceRenderProperties, MapViewStyles } from 'src/types/Map';
import { getMapDrawingLayer } from './utils';
import MapViewStyleControl, { useMapViewStyle } from './MapViewStyleControl';
import UndoRedoBoundaryControl from './UndoRedoBoundaryControl';

export type ReadOnlyBoundary = {
  featureCollection: FeatureCollection;
  id: string;
  renderProperties: MapSourceRenderProperties;
};

export type EditableMapProps = {
  editMultiplePolygons?: boolean;
  boundary?: FeatureCollection;
  onBoundaryChanged: (boundary?: FeatureCollection) => void;
  setMode?: (mode: MapEditorMode) => void;
  readOnlyBoundaries?: ReadOnlyBoundary[];
  style?: object;
};

export default function EditableMap({
  editMultiplePolygons,
  boundary,
  onBoundaryChanged,
  readOnlyBoundaries,
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
    bounds: readOnlyBoundaries?.length
      ? (bbox(
          readOnlyBoundaries!.flatMap((b) => b.featureCollection.features).flatMap((feature) => feature.geometry)[0]
        ) as LngLatBoundsLike)
      : undefined,
    fitBoundsOptions: {
      animate: false,
      padding: 25,
    },
  };

  const onUndoRedo = useCallback((data?: FeatureCollection) => void onBoundaryChanged(data), [onBoundaryChanged]);

  const mapLayers = useMemo(() => {
    if (!readOnlyBoundaries?.length) {
      return null;
    }
    return readOnlyBoundaries!.map((data: ReadOnlyBoundary) => {
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
  }, [readOnlyBoundaries]);

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
              editMultiplePolygons={editMultiplePolygons}
              boundary={boundary}
              onBoundaryChanged={onBoundaryChanged}
              setMode={setMode}
            />
            <UndoRedoBoundaryControl boundary={boundary} onBoundaryChanged={onUndoRedo} />
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
