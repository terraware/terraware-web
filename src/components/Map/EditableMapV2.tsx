import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMapGL, {
  FullscreenControl,
  GeolocateControl,
  Layer,
  LngLatBoundsLike,
  MapLayerMouseEvent,
  MapRef,
  MapboxGeoJSONFeature,
  NavigationControl,
  Popup,
  Source,
} from 'react-map-gl';
import { Box, useTheme, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import bbox from '@turf/bbox';
import { FeatureCollection, MultiPolygon } from 'geojson';
import { MapPopupRenderer, MapSourceRenderProperties, MapViewStyles, PopupInfo, ReadOnlyBoundary } from 'src/types/Map';
import { getRgbaFromHex } from 'src/utils/color';
import EditableMapDraw, { MapEditorMode } from 'src/components/Map/EditableMapDrawV2';
import useMapboxToken from 'src/utils/useMapboxToken';
import { useIsVisible } from 'src/hooks/useIsVisible';
import { getMapDrawingLayer, toMultiPolygon } from './utils';
import MapViewStyleControl, { useMapViewStyle } from './MapViewStyleControl';
import UndoRedoBoundaryControl from './UndoRedoBoundaryControl';

const useStyles = makeStyles((theme: Theme) => ({
  sliceTool: {
    '& .mapbox-gl-draw_polygon': {
      backgroundImage: 'url("/assets/icon-slice.svg")',
      backgroundColor: 'transparent',
      backgroundPosition: 'center',
      backgroundSize: '20px',
      backgroundRepeat: 'no-repeat',
      height: '29px',
      width: '29px',
      padding: '9px',
    },
    '& .mapbox-gl-draw_polygon.active': {
      backgroundColor: getRgbaFromHex(theme.palette.TwClrBaseGray100 as string, 0.5),
    },
  },
}));

export type RenderableReadOnlyBoundary = ReadOnlyBoundary & {
  renderProperties: MapSourceRenderProperties;
};

// Callback to select one feature from among list of features on the map that overlap the click target.
export type LayerFeature = MapboxGeoJSONFeature;
export type FeatureSelectorOnClick = (features: LayerFeature[]) => LayerFeature | undefined;

export type EditableMapProps = {
  allowEditMultiplePolygons?: boolean;
  clearOnEdit?: boolean;
  editableBoundary?: FeatureCollection;
  featureSelectorOnClick?: FeatureSelectorOnClick;
  onEditableBoundaryChanged: (boundary?: FeatureCollection, isUndoRedo?: boolean) => void;
  onUndoRedoReadOnlyBoundary?: (readOnlyBoundary?: ReadOnlyBoundary[]) => void;
  overridePopupInfo?: PopupInfo;
  popupRenderer?: MapPopupRenderer;
  setMode?: (mode: MapEditorMode) => void;
  readOnlyBoundary?: RenderableReadOnlyBoundary[];
  style?: object;
};

export default function EditableMap({
  allowEditMultiplePolygons,
  clearOnEdit,
  editableBoundary,
  featureSelectorOnClick,
  onEditableBoundaryChanged,
  onUndoRedoReadOnlyBoundary,
  overridePopupInfo,
  popupRenderer,
  readOnlyBoundary,
  setMode,
  style,
}: EditableMapProps): JSX.Element {
  const { mapId, refreshToken, token } = useMapboxToken();
  const [editMode, setEditMode] = useState<MapEditorMode>();
  const [firstVisible, setFirstVisible] = useState<boolean>(false);
  const [interactiveLayerIds, setInteractiveLayerIds] = useState<string[] | undefined>();
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [isOverridePopupEvent, setIsOverridePopupEvent] = useState<boolean>(false);
  const containerRef = useRef(null);
  const mapRef = useRef<MapRef | null>(null);
  const visible = useIsVisible(containerRef);
  const theme = useTheme();
  const [mapViewStyle, onChangeMapViewStyle] = useMapViewStyle();
  const classes = useStyles();

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

  // clear popup state and set geometry as not selected (so rendering shows it as not selected)
  const clearPopupInfo = useCallback(() => {
    setPopupInfo((curr) => {
      if (curr) {
        const { sourceId, id } = curr;
        // clear selection
        mapRef?.current?.setFeatureState({ source: sourceId, id: `${id}` }, { select: false });
      }
      return null;
    });
  }, [mapRef]);

  // set new popup state and mark geometry as selected (renders as selected)
  const initializePopupInfo = useCallback(
    (info: PopupInfo) => {
      clearPopupInfo();
      // update selection
      mapRef?.current?.setFeatureState({ source: info.sourceId, id: `${info.id}` }, { select: true });
      setPopupInfo(info);
    },
    [clearPopupInfo, mapRef]
  );

  // renderer memoized
  const renderedPopup = useMemo<JSX.Element | null>(() => {
    if (!popupInfo || !popupRenderer) {
      return null;
    }
    return popupRenderer.render(popupInfo.properties, clearPopupInfo);
  }, [clearPopupInfo, popupInfo, popupRenderer]);

  // map click to fetch geometry and show a popup at that location
  const onMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      if (isOverridePopupEvent) {
        if (overridePopupInfo) {
          initializePopupInfo(overridePopupInfo);
        }
        setIsOverridePopupEvent(false);
        return;
      }

      if (!event?.features) {
        return;
      }

      const feature = featureSelectorOnClick?.(event.features);

      if (feature && feature.properties) {
        const { lat, lng } = event.lngLat;
        const { id, properties, layer } = feature;
        const sourceId = layer.source as string;

        if (!readOnlyBoundary?.find((b) => b.id === sourceId)) {
          return;
        }

        initializePopupInfo({
          id,
          lng,
          lat,
          properties,
          sourceId,
        });
      }
    },
    [featureSelectorOnClick, initializePopupInfo, isOverridePopupEvent, overridePopupInfo, readOnlyBoundary]
  );

  useEffect(() => {
    if (editMode) {
      setMode?.(editMode);
    }
  }, [editMode, setMode]);

  useEffect(() => {
    // `firstVisible` detects when the box containing the map is first visible in the viewport. The map should only be
    // rendered if `firstVisible` is true. This accounts for cases in which the map is initially rendered hidden, and
    // is improperly resized when it first becomes visible.
    setFirstVisible((fv) => fv || visible);
  }, [visible]);

  useEffect(() => {
    if (!popupRenderer || editMode === 'CreatingBoundary') {
      // no interactive capabilities enabled
      setInteractiveLayerIds(undefined);
    } else {
      setInteractiveLayerIds(readOnlyBoundary?.filter((b) => b.isInteractive).map((b) => `${b.id}-fill`));
    }
  }, [editMode, popupRenderer, readOnlyBoundary]);

  // If override popup is set in the component prop, update local state as well.
  // Separate useEffect from clearing popup state due to dependencies.
  useEffect(() => {
    if (overridePopupInfo) {
      setIsOverridePopupEvent(true);
    }
  }, [overridePopupInfo]);

  return (
    <Box
      className={clearOnEdit ? classes.sliceTool : ''}
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
            interactiveLayerIds={interactiveLayerIds ?? []}
            onClick={onMapClick}
          >
            {mapLayers}
            <FullscreenControl position='top-left' />
            <MapViewStyleControl mapViewStyle={mapViewStyle} onChangeMapViewStyle={onChangeMapViewStyle} />
            <EditableMapDraw
              allowEditMultiplePolygons={allowEditMultiplePolygons}
              clearOnEdit={clearOnEdit}
              boundary={editableBoundary}
              onBoundaryChanged={onEditableBoundaryChanged}
              setMode={setEditMode}
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
            {popupInfo && popupRenderer && renderedPopup && (
              <Popup
                anchor={popupRenderer.anchor ?? 'top'}
                key={popupInfo.id}
                longitude={Number(popupInfo.lng)}
                latitude={Number(popupInfo.lat)}
                onClose={clearPopupInfo}
                style={popupRenderer.style}
                className={popupRenderer.className}
              >
                {renderedPopup}
              </Popup>
            )}
          </ReactMapGL>
        </>
      )}
    </Box>
  );
}
