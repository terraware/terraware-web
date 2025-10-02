import React, { MutableRefObject, ReactNode, useCallback, useMemo, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { MapMouseEvent } from 'mapbox-gl';

import MapBox from './MapBox';
import MapContainer from './MapContainer';
import MapDrawer, { MapDrawerSize } from './MapDrawer';
import MapLegend, { MapHighlightLegendItem, MapLegendGroup } from './MapLegend';
import { MapCursor, MapHighlightGroup, MapLayer, MapMarkerGroup, MapViewStyle } from './types';
import { getBoundingBox, getBoundsZoomLevel } from './utils';

type BaseMapFeatureSection = {
  sectionDisabled?: boolean;
  sectionTitle: string;
  sectionTooltip?: string;
};

export type MapHighlightFeatureSection = {
  highlight: MapHighlightGroup;
  legendItems: MapHighlightLegendItem[];
  type: 'highlight';
} & BaseMapFeatureSection;

export type MapLayerFeatureSection = {
  layers: MapLayer[];
  type: 'layer';
} & BaseMapFeatureSection;

export type MapMarkerFeatureSection = {
  groups: MapMarkerGroup[];
  type: 'marker';
} & BaseMapFeatureSection;

export type MapFeatureSection = MapHighlightFeatureSection | MapLayerFeatureSection | MapMarkerFeatureSection;

export type MapComponentProps = {
  clusterRadius?: number;
  controlBottomLeft?: React.ReactNode;
  controlTopRight?: React.ReactNode;
  controlTopLeft?: React.ReactNode;
  cursorInteract?: MapCursor;
  cursorMap?: MapCursor;
  disableDoubleClickZoom?: boolean;
  disableZoom?: boolean;
  drawerChildren?: ReactNode;
  drawerHideCloseButton?: boolean;
  drawerHideHeader?: boolean;
  drawerOpen?: boolean;
  drawerRef?: MutableRefObject<HTMLDivElement | null>;
  drawerSize?: MapDrawerSize;
  drawerTitle?: string;
  features?: MapFeatureSection[];
  hideFullScreenControl?: boolean;
  hideLegend?: boolean;
  hideMapViewStyleControl?: boolean;
  hideZoomControl?: boolean;
  initialSelectedLayerId?: string;
  initialMapViewStyle?: MapViewStyle;
  initialViewState?: {
    latitude?: number;
    longitude?: number;
    zoom?: number;
  };
  mapContainerId?: string;
  mapId?: string;
  mapRef: MutableRefObject<MapRef | null>;
  onClickCanvas?: (event: MapMouseEvent) => void;
  setDrawerOpen?: (open: boolean) => void;
  setHighlightVisible?: (highlightId: string) => (visible: boolean) => void;
  setMarkerVisible?: (markerGroupId: string) => (visible: boolean) => void;
  token: string;
};

const MapComponent = (props: MapComponentProps) => {
  const {
    clusterRadius,
    controlBottomLeft,
    controlTopRight,
    controlTopLeft,
    cursorInteract,
    cursorMap,
    disableDoubleClickZoom,
    disableZoom,
    drawerChildren,
    drawerHideCloseButton,
    drawerHideHeader,
    drawerOpen,
    drawerRef,
    drawerSize,
    drawerTitle,
    features,
    hideFullScreenControl,
    hideLegend,
    hideMapViewStyleControl,
    hideZoomControl,
    initialSelectedLayerId,
    initialMapViewStyle,
    initialViewState,
    mapContainerId,
    mapId,
    mapRef,
    onClickCanvas,
    setDrawerOpen,
    setHighlightVisible,
    setMarkerVisible,
    token,
  } = props;
  const [mapViewStyle, setMapViewStyle] = useState<MapViewStyle>(initialMapViewStyle ?? 'Streets');
  const [selectedLayer, setSelectedLayer] = useState<string | undefined>(initialSelectedLayerId);

  const legends = useMemo((): MapLegendGroup[] | undefined => {
    return features?.map((feature): MapLegendGroup => {
      const baseLegendGroup = {
        disabled: feature.sectionDisabled,
        title: feature.sectionTitle,
        tooltip: feature.sectionTooltip,
      };
      switch (feature.type) {
        case 'highlight':
          return {
            ...baseLegendGroup,
            items: feature.legendItems,
            type: 'highlight',
            visible: feature.highlight.visible,
            setVisible: setHighlightVisible?.(feature.highlight.highlightId),
          };
        case 'layer':
          return {
            ...baseLegendGroup,
            items: feature.layers.map((layer) => ({
              disabled: layer.disabled,
              id: layer.layerId,
              label: layer.label,
              style: layer.style,
            })),
            selectedLayer,
            setSelectedLayer,
            type: 'layer',
          };
        case 'marker':
          return {
            ...baseLegendGroup,
            items: feature.groups.map((group) => ({
              disabled: group.disabled,
              id: group.markerGroupId,
              label: group.label,
              style: group.style,
              setVisible: setMarkerVisible?.(group.markerGroupId),
              visible: group.visible,
            })),
            type: 'marker',
          };
      }
    });
  }, [features, selectedLayer, setHighlightVisible, setMarkerVisible]);

  const layers = useMemo(() => {
    return features
      ?.filter((feature): feature is MapLayerFeatureSection => feature.type === 'layer')
      ?.flatMap((feature) => feature.layers)
      ?.filter((layer) => layer.layerId === selectedLayer);
  }, [features, selectedLayer]);

  const highlightGroups = useMemo(() => {
    return features
      ?.filter((feature): feature is MapHighlightFeatureSection => feature.type === 'highlight')
      ?.map((feature) => feature.highlight);
  }, [features]);

  const markerGroups = useMemo(() => {
    return features
      ?.filter((feature): feature is MapMarkerFeatureSection => feature.type === 'marker')
      ?.flatMap((feature) => feature.groups);
  }, [features]);

  const mapViewState = useMemo(() => {
    if (initialViewState) {
      return initialViewState;
    } else if (features) {
      const multipolygons = features
        .filter((feature): feature is MapLayerFeatureSection => feature.type === 'layer')
        .flatMap((feature) => feature.layers)
        .flatMap((layer) => layer.features)
        .map((geoFeature) => geoFeature.geometry);

      const { minLat, minLng, maxLat, maxLng } = getBoundingBox(multipolygons);

      const centerLng = (minLng + maxLng) / 2;
      const centerLat = (minLat + maxLat) / 2;

      const zoom = getBoundsZoomLevel({ minLat, minLng, maxLat, maxLng }, 400, 400);

      return {
        latitude: centerLat,
        longitude: centerLng,
        zoom,
      };
    }
  }, [features, initialViewState]);

  const mapImageUrls = useMemo(() => {
    const layerFeatures =
      features?.filter((feature): feature is MapLayerFeatureSection => feature.type === 'layer') ?? [];
    const highlightFeatures =
      features?.filter((feature): feature is MapHighlightFeatureSection => feature.type === 'highlight') ?? [];

    const layerImageUrls = layerFeatures
      .flatMap((feature) => feature.layers)
      .map((layer) => layer.style.fillPatternUrl)
      .filter((url): url is string => url !== undefined);

    const highlightImageUrls = highlightFeatures
      .flatMap((feature) => feature.highlight.highlights)
      .map((highlight) => highlight.style.fillPatternUrl)
      .filter((url): url is string => url !== undefined);

    const imageUrls = new Set(layerImageUrls);
    highlightImageUrls.forEach((url) => imageUrls.add(url));

    return Array.from(imageUrls);
  }, [features]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen?.(false);
  }, [setDrawerOpen]);

  const map = useMemo(() => {
    return (
      <MapBox
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
        highlightGroups={highlightGroups}
        initialViewState={mapViewState}
        layers={layers}
        mapId={mapId ?? 'mapId'}
        mapImageUrls={mapImageUrls}
        mapRef={mapRef}
        mapViewStyle={mapViewStyle}
        markerGroups={markerGroups}
        onClickCanvas={onClickCanvas}
        setMapViewStyle={setMapViewStyle}
        token={token}
      />
    );
  }, [
    clusterRadius,
    controlBottomLeft,
    controlTopLeft,
    controlTopRight,
    cursorInteract,
    cursorMap,
    disableDoubleClickZoom,
    disableZoom,
    drawerOpen,
    hideFullScreenControl,
    hideMapViewStyleControl,
    hideZoomControl,
    highlightGroups,
    layers,
    mapContainerId,
    mapId,
    mapImageUrls,
    mapRef,
    mapViewState,
    mapViewStyle,
    markerGroups,
    onClickCanvas,
    token,
  ]);

  return (
    <MapContainer
      containerId={mapContainerId ?? 'map-container'}
      map={map}
      drawer={
        <MapDrawer
          drawerRef={drawerRef}
          hideCloseButton={drawerHideCloseButton}
          hideHeader={drawerHideHeader}
          open={drawerOpen ?? false}
          onClose={closeDrawer}
          size={drawerSize ?? 'small'}
          title={drawerTitle ?? ''}
        >
          {drawerChildren}
        </MapDrawer>
      }
      drawerOpen={drawerOpen}
      legend={!hideLegend && legends && <MapLegend legends={legends} />}
    />
  );
};

export default MapComponent;
