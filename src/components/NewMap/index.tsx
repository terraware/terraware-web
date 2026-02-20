import React, { CSSProperties, MutableRefObject, ReactNode, useCallback, useMemo } from 'react';
import { MapRef, ViewStateChangeEvent } from 'react-map-gl/mapbox';

import { MapMouseEvent } from 'mapbox-gl';

import MapBox from './MapBox';
import MapContainer from './MapContainer';
import MapDrawer, { MapDrawerSize } from './MapDrawer';
import MapLegend, { MapLegendGroup } from './MapLegend';
import { MapCursor, MapHighlightGroup, MapLayer, MapMarkerGroup, MapNameTag, MapViewState } from './types';
import useStickyMapViewStyle from './useStickyMapViewStyle';
import { getBoundingBoxFromMultiPolygons, getBoundsZoomLevel } from './utils';

export type MapComponentProps = {
  additionalComponent?: React.ReactNode;
  clusterMaxZoom?: number;
  clusterRadius?: number;
  containerStyle?: CSSProperties;
  controlBottomLeft?: React.ReactNode;
  controlTopRight?: React.ReactNode;
  controlTopLeft?: React.ReactNode;
  cursorInteract?: MapCursor;
  cursorMap?: MapCursor;
  disableDoubleClickZoom?: boolean;
  disableZoom?: boolean;
  drawerChildren?: ReactNode;
  drawerHeader?: ReactNode;
  drawerHideCloseButton?: boolean;
  drawerHideHeader?: boolean;
  drawerOpen?: boolean;
  drawerRef?: MutableRefObject<HTMLDivElement | null>;
  drawerSize?: MapDrawerSize;
  hideBorder?: boolean;
  hideFullScreenControl?: boolean;
  hideMapViewStyleControl?: boolean;
  hideZoomControl?: boolean;
  initialViewState?: MapViewState;
  legends?: MapLegendGroup[];
  mapContainerId?: string;
  mapHighlights?: MapHighlightGroup[];
  mapId?: string;
  mapLayers?: MapLayer[];
  mapMarkers?: MapMarkerGroup[];
  mapRef: MutableRefObject<MapRef | null>;
  nameTags?: MapNameTag[];
  onClickCanvas?: (event: MapMouseEvent) => void;
  onMapMove?: (view: ViewStateChangeEvent) => void;
  onMouseMove?: (event: MapMouseEvent) => void;
  onTokenExpired?: () => void;
  setDrawerOpen?: (open: boolean) => void;
  token: string;
};

const MapComponent = (props: MapComponentProps) => {
  const {
    additionalComponent,
    clusterMaxZoom,
    clusterRadius,
    containerStyle,
    controlBottomLeft,
    controlTopRight,
    controlTopLeft,
    cursorInteract,
    cursorMap,
    disableDoubleClickZoom,
    disableZoom,
    drawerChildren,
    drawerHeader,
    drawerHideCloseButton,
    drawerHideHeader,
    drawerOpen,
    drawerRef,
    drawerSize,
    hideBorder,
    hideFullScreenControl,
    hideMapViewStyleControl,
    hideZoomControl,
    initialViewState,
    legends,
    mapContainerId,
    mapHighlights,
    mapId,
    mapLayers,
    mapMarkers,
    mapRef,
    nameTags,
    onClickCanvas,
    onMapMove,
    onMouseMove,
    onTokenExpired,
    setDrawerOpen,
    token,
  } = props;

  const { mapViewStyle, updateMapViewStyle } = useStickyMapViewStyle({ defaultStyle: 'Outdoors', key: 'map-style' });

  const mapViewState = useMemo(() => {
    if (initialViewState) {
      return initialViewState;
    } else if (mapLayers?.length) {
      const multipolygons = mapLayers.flatMap((layer) => layer.features).map((geoFeature) => geoFeature.geometry);

      const { minLat, minLng, maxLat, maxLng } = getBoundingBoxFromMultiPolygons(multipolygons);

      const centerLng = (minLng + maxLng) / 2;
      const centerLat = (minLat + maxLat) / 2;

      const zoom = getBoundsZoomLevel({ minLat, minLng, maxLat, maxLng }, 400, 400);

      return {
        latitude: centerLat,
        longitude: centerLng,
        zoom,
      };
    }
  }, [initialViewState, mapLayers]);

  const mapImageUrls = useMemo(() => {
    const layerImageUrls = mapLayers
      ?.map((layer) => layer.style.fillPatternUrl)
      .filter((url): url is string => url !== undefined);

    const highlightImageUrls = mapHighlights
      ?.flatMap((feature) => feature.highlights)
      .map((highlight) => highlight.style.fillPatternUrl)
      .filter((url): url is string => url !== undefined);

    const imageUrls = new Set(layerImageUrls);
    highlightImageUrls?.forEach((url) => imageUrls.add(url));

    return Array.from(imageUrls);
  }, [mapHighlights, mapLayers]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen?.(false);
  }, [setDrawerOpen]);

  const map = useMemo(() => {
    return (
      <MapBox
        additionalComponent={additionalComponent}
        clusterMaxZoom={clusterMaxZoom}
        clusterRadius={clusterRadius}
        containerId={mapContainerId ?? 'map-container'}
        controlBottomLeft={controlBottomLeft}
        controlTopRight={controlTopRight}
        controlTopLeft={controlTopLeft}
        cursorInteract={cursorInteract}
        cursorMap={cursorMap}
        disableDoubleClickZoom={disableDoubleClickZoom}
        disableZoom={disableZoom}
        drawerOpen={drawerOpen}
        hideFullScreenControl={hideFullScreenControl}
        hideMapViewStyleControl={hideMapViewStyleControl}
        hideZoomControl={hideZoomControl}
        highlightGroups={mapHighlights}
        initialViewState={mapViewState}
        layers={mapLayers}
        mapId={mapId ?? 'mapId'}
        mapImageUrls={mapImageUrls}
        mapRef={mapRef}
        mapViewStyle={mapViewStyle}
        markerGroups={mapMarkers}
        nameTags={nameTags}
        onClickCanvas={onClickCanvas}
        onMapMove={onMapMove}
        onMouseMove={onMouseMove}
        onTokenExpired={onTokenExpired}
        setMapViewStyle={updateMapViewStyle}
        token={token}
      />
    );
  }, [
    additionalComponent,
    clusterMaxZoom,
    clusterRadius,
    mapContainerId,
    controlBottomLeft,
    controlTopRight,
    controlTopLeft,
    cursorInteract,
    cursorMap,
    disableDoubleClickZoom,
    disableZoom,
    drawerOpen,
    hideFullScreenControl,
    hideMapViewStyleControl,
    hideZoomControl,
    mapHighlights,
    mapViewState,
    mapLayers,
    mapId,
    mapImageUrls,
    mapRef,
    mapViewStyle,
    mapMarkers,
    nameTags,
    onClickCanvas,
    onMapMove,
    onMouseMove,
    onTokenExpired,
    updateMapViewStyle,
    token,
  ]);

  return (
    <MapContainer
      containerId={mapContainerId ?? 'map-container'}
      drawer={
        <MapDrawer
          drawerRef={drawerRef}
          headerComponent={drawerHeader}
          hideBorder={hideBorder}
          hideCloseButton={drawerHideCloseButton}
          hideHeader={drawerHideHeader}
          open={drawerOpen ?? false}
          onClose={closeDrawer}
          size={drawerSize ?? 'small'}
        >
          {drawerChildren}
        </MapDrawer>
      }
      drawerOpen={drawerOpen}
      hideBorder={hideBorder}
      legend={legends && <MapLegend legends={legends} />}
      map={map}
      style={containerStyle}
    />
  );
};

export default MapComponent;
