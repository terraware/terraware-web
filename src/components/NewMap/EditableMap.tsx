import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GeolocateControl, Layer, MapRef, Popup, Source } from 'react-map-gl/mapbox';

import { AddressAutofillFeatureSuggestion } from '@mapbox/search-js-core';
import { Box, useTheme } from '@mui/material';
import { Feature, FeatureCollection, MultiPolygon } from 'geojson';
import { MapMouseEvent } from 'mapbox-gl';

import EditableMapDraw, { MapEditorMode } from 'src/components/Map/EditableMapDrawV2';
import MapSearchBox from 'src/components/Map/MapSearchBox';
import UndoRedoControl from 'src/components/Map/UndoRedoControl';
import { getMapErrorLayer, toMultiPolygon } from 'src/components/Map/utils';
import { MapPopupRenderer, PopupInfo } from 'src/types/Map';
import { getRgbaFromHex } from 'src/utils/color';
import useMapboxToken from 'src/utils/useMapboxToken';

import MapComponent from '.';
import { MapFillComponentStyle, MapLayer, MapProperties } from './types';
import useMapUtils from './useMapUtils';
import { getBoundingBoxFromMultiPolygons } from './utils';

export type EditableMapBoundary = {
  data: FeatureCollection;
  id: string;
  isInteractive?: boolean;
  labelProperty?: string;
  selectedId?: number;
  style: MapFillComponentStyle;
};

export type EditableMapClickedFeature = {
  boundaryId: string;
  feature: Feature;
};

type FeatureSelectorOnClick = (features: EditableMapClickedFeature[]) => EditableMapClickedFeature | undefined;

export type EditableMapProps = {
  editableBoundary?: FeatureCollection;
  errorAnnotations?: Feature[];
  featureSelectorOnClick?: FeatureSelectorOnClick;
  isSliceTool?: boolean;
  onEditableBoundaryChanged: (boundary?: FeatureCollection) => void;
  onRedo?: () => void;
  onUndo?: () => void;
  overridePopupInfo?: PopupInfo;
  popupRenderer?: MapPopupRenderer;
  readOnlyBoundary?: EditableMapBoundary[];
  setMode?: (mode: MapEditorMode) => void;
  showSearchBox?: boolean;
};

const featureIdOf = (feature: Feature): string => `${feature.properties?.id ?? feature.id}`;

const EditableMap = ({
  editableBoundary,
  errorAnnotations,
  featureSelectorOnClick,
  isSliceTool,
  onEditableBoundaryChanged,
  onRedo,
  onUndo,
  overridePopupInfo,
  popupRenderer,
  readOnlyBoundary,
  setMode,
  showSearchBox,
}: EditableMapProps): JSX.Element => {
  const theme = useTheme();
  const { mapId, refreshToken, token } = useMapboxToken();
  const mapRef = useRef<MapRef | null>(null);
  const { fitBounds } = useMapUtils(mapRef);
  const [editMode, setEditMode] = useState<MapEditorMode>();
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);

  const [initialBounds] = useState(() => {
    const multiPolygons = [
      ...(readOnlyBoundary ?? []).flatMap((boundary) => boundary.data.features),
      ...(editableBoundary?.features ?? []),
    ]
      .map((feature) => toMultiPolygon(feature.geometry))
      .filter((multiPolygon): multiPolygon is MultiPolygon => multiPolygon !== null);
    return multiPolygons.length ? getBoundingBoxFromMultiPolygons(multiPolygons) : undefined;
  });

  const fittedMapId = useRef<string | null | undefined>(null);
  const onMapLoad = useCallback(() => {
    if (initialBounds && fittedMapId.current !== mapId) {
      fittedMapId.current = mapId;
      fitBounds(initialBounds, 25);
    }
  }, [fitBounds, initialBounds, mapId]);

  const clearPopupInfo = useCallback(() => setPopupInfo(null), []);

  const openPopup = useCallback((info: PopupInfo) => {
    // defer so the click that opened the popup doesn't also close it
    setTimeout(() => setPopupInfo(info), 0);
  }, []);

  useEffect(() => {
    if (overridePopupInfo) {
      openPopup(overridePopupInfo);
    }
  }, [openPopup, overridePopupInfo]);

  useEffect(() => {
    if (editMode) {
      setMode?.(editMode);
    }
  }, [editMode, setMode]);

  const onFeatureClick = useCallback(
    (event: MapMouseEvent) => {
      const seen = new Set<string>();
      const clickedFeatures = (event.features ?? [])
        .map((mapFeature) => mapFeature.properties as MapProperties | null)
        .filter((properties): properties is MapProperties => {
          if (!properties || seen.has(properties.layerFeatureId)) {
            return false;
          }
          seen.add(properties.layerFeatureId);
          return true;
        })
        .map((properties): EditableMapClickedFeature | undefined => {
          const feature = readOnlyBoundary
            ?.find((boundary) => boundary.id === properties.layerId)
            ?.data.features.find((boundaryFeature) => featureIdOf(boundaryFeature) === `${properties.id}`);
          return feature ? { boundaryId: properties.layerId, feature } : undefined;
        })
        .filter((clicked): clicked is EditableMapClickedFeature => clicked !== undefined);

      const selected = featureSelectorOnClick?.(clickedFeatures);
      if (selected) {
        openPopup({
          id: selected.feature.properties?.id ?? selected.feature.id,
          lng: event.lngLat.lng,
          lat: event.lngLat.lat,
          properties: selected.feature.properties,
          sourceId: selected.boundaryId,
        });
      }
    },
    [featureSelectorOnClick, openPopup, readOnlyBoundary]
  );

  const isInteractive = !!popupRenderer && editMode !== 'CreatingBoundary' && !errorAnnotations?.length;

  const mapLayers = useMemo(
    (): MapLayer[] | undefined =>
      readOnlyBoundary?.map((boundary) => ({
        features: boundary.data.features.flatMap((feature) => {
          const geometry = toMultiPolygon(feature.geometry);
          if (!geometry) {
            return [];
          }
          const featureId = featureIdOf(feature);
          const hasPopup = popupInfo?.sourceId === boundary.id && `${popupInfo.id}` === featureId;
          return [
            {
              featureId,
              geometry,
              label: boundary.labelProperty ? feature.properties?.[boundary.labelProperty] : undefined,
              onClick: boundary.isInteractive && isInteractive ? onFeatureClick : undefined,
              selected: hasPopup || `${boundary.selectedId}` === featureId,
            },
          ];
        }),
        layerId: boundary.id,
        style: boundary.style,
        visible: true,
      })),
    [isInteractive, onFeatureClick, popupInfo, readOnlyBoundary]
  );

  const renderedPopup = useMemo(
    () => (popupInfo && popupRenderer ? popupRenderer.render(popupInfo.properties, clearPopupInfo) : null),
    [clearPopupInfo, popupInfo, popupRenderer]
  );

  const additionalComponent = useMemo(() => {
    const errorLayer = getMapErrorLayer(theme, 'errorAnnotations');

    return (
      <>
        <Source
          type='geojson'
          id='errorAnnotations'
          data={{ type: 'FeatureCollection', features: errorAnnotations ?? [] }}
        >
          {errorLayer.errorText && <Layer {...errorLayer.errorText} />}
          {errorLayer.errorLine && <Layer {...errorLayer.errorLine} />}
          {errorLayer.errorFill && <Layer {...errorLayer.errorFill} />}
        </Source>
        <EditableMapDraw
          boundary={editableBoundary}
          onBoundaryCreated={onEditableBoundaryChanged}
          onBoundaryDeleted={onEditableBoundaryChanged}
          onBoundaryUpdated={onEditableBoundaryChanged}
          setMode={setEditMode}
        />
        <UndoRedoControl onRedo={onRedo} onUndo={onUndo} />
        <GeolocateControl
          fitBoundsOptions={{ maxDuration: 1500 }}
          position='bottom-right'
          positionOptions={{ enableHighAccuracy: true }}
          style={{ marginRight: theme.spacing(2) }}
        />
        {popupInfo && popupRenderer && renderedPopup && (
          <Popup
            anchor={popupRenderer.anchor ?? 'top'}
            className={popupRenderer.className}
            closeButton={false}
            key={popupInfo.id}
            latitude={Number(popupInfo.lat)}
            longitude={Number(popupInfo.lng)}
            onClose={clearPopupInfo}
            style={popupRenderer.style}
          >
            {renderedPopup}
          </Popup>
        )}
      </>
    );
  }, [
    clearPopupInfo,
    editableBoundary,
    errorAnnotations,
    onEditableBoundaryChanged,
    onRedo,
    onUndo,
    popupInfo,
    popupRenderer,
    renderedPopup,
    theme,
  ]);

  const onSearchSelect = useCallback((features: AddressAutofillFeatureSuggestion[] | null) => {
    if (features?.length) {
      const [lng, lat] = features[0].geometry.coordinates;
      mapRef.current?.flyTo({ center: [lng, lat], essential: true, zoom: 10 });
    }
  }, []);

  return (
    <Box
      display='flex'
      flexDirection='column'
      flexGrow={1}
      sx={
        isSliceTool
          ? {
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
            }
          : undefined
      }
    >
      {showSearchBox && (
        <Box paddingBottom={theme.spacing(2)}>
          <MapSearchBox onSelect={onSearchSelect} />
        </Box>
      )}
      <MapComponent
        additionalComponent={additionalComponent}
        containerStyle={{ flexGrow: 1, height: 'auto', maxHeight: 'none', minHeight: '640px' }}
        mapId={mapId}
        mapLayers={mapLayers}
        mapRef={mapRef}
        onMapLoad={onMapLoad}
        onTokenExpired={refreshToken}
        token={token ?? ''}
      />
    </Box>
  );
};

export default EditableMap;
