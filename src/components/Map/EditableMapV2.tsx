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
import { Feature, FeatureCollection, MultiPolygon } from 'geojson';
import {
  MapDrawingLayer,
  MapEntityId,
  MapEntityOptions,
  MapErrorLayer,
  MapPopupRenderer,
  MapViewStyles,
  PopupInfo,
  RenderableReadOnlyBoundary,
} from 'src/types/Map';
import { getRgbaFromHex } from 'src/utils/color';
import EditableMapDraw, { MapEditorMode } from 'src/components/Map/EditableMapDrawV2';
import useMapboxToken from 'src/utils/useMapboxToken';
import { useIsVisible } from 'src/hooks/useIsVisible';
import { getMapDrawingLayer, getMapErrorLayer, toMultiPolygon } from './utils';
import MapViewStyleControl, { useMapViewStyle } from './MapViewStyleControl';
import UndoRedoControl from './UndoRedoControl';

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

// Callback to select one feature from among list of features on the map that overlap the click target.
export type LayerFeature = MapboxGeoJSONFeature;
export type FeatureSelectorOnClick = (features: LayerFeature[]) => LayerFeature | undefined;

export type EditableMapProps = {
  activeContext?: MapEntityOptions;
  clearOnEdit?: boolean;
  editableBoundary?: FeatureCollection;
  errorAnnotations?: Feature[];
  featureSelectorOnClick?: FeatureSelectorOnClick;
  onEditableBoundaryChanged: (boundary?: FeatureCollection, isUndoRedo?: boolean) => void;
  onRedo?: () => void;
  onUndo?: () => void;
  overridePopupInfo?: PopupInfo;
  popupRenderer?: MapPopupRenderer;
  readOnlyBoundary?: RenderableReadOnlyBoundary[];
  setMode?: (mode: MapEditorMode) => void;
  style?: object;
};

export default function EditableMap({
  activeContext,
  clearOnEdit,
  editableBoundary,
  errorAnnotations,
  featureSelectorOnClick,
  onEditableBoundaryChanged,
  onRedo,
  onUndo,
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
  const [, setActiveContext] = useState<MapEntityOptions | undefined>();
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
            .flatMap((b) => b.data.features)
            .flatMap((feature) => toMultiPolygon(feature.geometry))
            .filter((poly: MultiPolygon | null) => poly !== null)
            .flatMap((poly: MultiPolygon | null) => poly!.coordinates),
        }) as LngLatBoundsLike)
      : editableBoundary
      ? (bbox(editableBoundary) as LngLatBoundsLike)
      : undefined,
    fitBoundsOptions: {
      animate: false,
      padding: 25,
    },
  };

  const mapLayers = useMemo(() => {
    if (!readOnlyBoundary?.length) {
      return null;
    }

    return readOnlyBoundary!.map((boundaryData: RenderableReadOnlyBoundary) => {
      const drawingLayer: MapDrawingLayer = getMapDrawingLayer(boundaryData.renderProperties, boundaryData.id);
      return (
        <Source type='geojson' key={boundaryData.id} data={boundaryData.data} id={boundaryData.id}>
          {drawingLayer.patternFill && <Layer {...drawingLayer.patternFill} />}
          {drawingLayer.textAnnotation && <Layer {...drawingLayer.textAnnotation} />}
          {drawingLayer.layerOutline && <Layer {...drawingLayer.layerOutline} />}
          {drawingLayer.layer && <Layer {...drawingLayer.layer} />}
        </Source>
      );
    });
  }, [readOnlyBoundary]);

  const errorLayer = useMemo(() => {
    const drawingLayer: MapErrorLayer = getMapErrorLayer(theme, 'errorAnnotations');
    return (
      <Source
        type='geojson'
        id='errorAnnotations'
        data={{ type: 'FeatureCollection', features: errorAnnotations ?? [] }}
      >
        {drawingLayer.errorText && <Layer {...drawingLayer.errorText} />}
        {drawingLayer.errorLine && <Layer {...drawingLayer.errorLine} />}
      </Source>
    );
  }, [errorAnnotations, theme]);

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
    const markActiveContext = (data: MapEntityId[], value: boolean) => {
      data.forEach((datum) => {
        const { id, sourceId: source } = datum;
        mapRef?.current?.setFeatureState({ source, id }, { select: value });
      });
    };

    setActiveContext((prev) => {
      markActiveContext(prev?.select ?? [], false);
      markActiveContext(activeContext?.select ?? [], true);
      return activeContext;
    });
  }, [activeContext, mapRef]);

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
    if (!popupRenderer || editMode === 'CreatingBoundary' || errorAnnotations?.length) {
      // no interactive capabilities enabled
      setInteractiveLayerIds(undefined);
    } else {
      setInteractiveLayerIds(readOnlyBoundary?.filter((b) => b.isInteractive).map((b) => `${b.id}-fill`));
    }
  }, [editMode, errorAnnotations, popupRenderer, readOnlyBoundary]);

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
            {errorLayer}
            <FullscreenControl position='top-left' />
            <MapViewStyleControl mapViewStyle={mapViewStyle} onChangeMapViewStyle={onChangeMapViewStyle} />
            <EditableMapDraw
              clearOnEdit={clearOnEdit}
              boundary={editableBoundary}
              onBoundaryChanged={onEditableBoundaryChanged}
              setMode={setEditMode}
            />
            <UndoRedoControl onRedo={onRedo} onUndo={onUndo} />
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
