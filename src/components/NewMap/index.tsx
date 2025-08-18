import React, { ReactNode, useCallback, useMemo, useState } from 'react';

import { MapMouseEvent } from 'mapbox-gl';

import MapBox from './MapBox';
import MapContainer from './MapContainer';
import MapDrawer, { MapDrawerSize } from './MapDrawer';
import MapLegend, { MapHighlightLegendItem, MapLegendGroup } from './MapLegend';
import { MapCursor, MapHighlightGroup, MapLayer, MapMarkerGroup, MapViewStyle } from './types';

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
  cursorInteract?: MapCursor;
  cursorMap?: MapCursor;
  disableDoubleClickZoom?: boolean;
  disableZoom?: boolean;
  drawerChildren?: ReactNode;
  drawerOpen?: boolean;
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
  onClickCanvas?: (event: MapMouseEvent) => void;
  setDrawerOpen?: (open: boolean) => void;
  token: string;
};

const MapComponent = (props: MapComponentProps) => {
  const {
    clusterRadius,
    controlBottomLeft,
    controlTopRight,
    cursorInteract,
    cursorMap,
    disableDoubleClickZoom,
    disableZoom,
    drawerChildren,
    drawerOpen,
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
    onClickCanvas,
    setDrawerOpen,
    token,
  } = props;
  const [mapViewStyle, setMapViewStyle] = useState<MapViewStyle>(initialMapViewStyle ?? 'Streets');

  const [visibleHighlights, setVisibleHighlights] = useState<string[]>([]);
  const setHighlightVisible = useCallback(
    (highlightId: string) => (visible: boolean) => {
      if (visible) {
        setVisibleHighlights((_visibleHighlights) => [..._visibleHighlights, highlightId]);
      } else {
        setVisibleHighlights((_visibleHighlights) =>
          _visibleHighlights.filter((_highlightId) => _highlightId !== highlightId)
        );
      }
    },
    []
  );

  const [visibleMarkers, setVisibleMarkers] = useState<string[]>([]);
  const setMarkerVisible = useCallback(
    (markerGroupId: string) => (visible: boolean) => {
      if (visible) {
        setVisibleMarkers((_visibleMarkers) => [..._visibleMarkers, markerGroupId]);
      } else {
        setVisibleMarkers((_visibleMarkers) =>
          _visibleMarkers.filter((_markerGroupId) => _markerGroupId !== markerGroupId)
        );
      }
    },
    []
  );

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
            visible: visibleHighlights.findIndex((highlightId) => highlightId === feature.highlight.highlightId) >= 0,
            setVisible: setHighlightVisible(feature.highlight.highlightId),
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
              setVisible: setMarkerVisible(group.markerGroupId),
              visible: visibleMarkers.findIndex((markerId) => markerId === group.markerGroupId) >= 0,
            })),
            type: 'marker',
          };
      }
    });
  }, [features, selectedLayer, visibleHighlights, visibleMarkers]);

  const layers = useMemo(() => {
    return features
      ?.filter((feature): feature is MapLayerFeatureSection => feature.type === 'layer')
      ?.flatMap((feature) => feature.layers)
      ?.filter((layer) => layer.layerId === selectedLayer);
  }, [features, selectedLayer]);

  const highlightGroups = useMemo(() => {
    return features
      ?.filter((feature): feature is MapHighlightFeatureSection => feature.type === 'highlight')
      ?.map((feature) => feature.highlight)
      ?.filter(
        (highlight) => visibleHighlights.findIndex((_highlightId) => _highlightId === highlight.highlightId) >= 0
      );
  }, [features, visibleHighlights]);

  const markerGroups = useMemo(() => {
    return features
      ?.filter((feature): feature is MapMarkerFeatureSection => feature.type === 'marker')
      ?.flatMap((feature) => feature.groups)
      .filter((group) => visibleMarkers.findIndex((_markerId) => _markerId === group.markerGroupId) >= 0);
  }, [features, visibleMarkers]);

  const mapViewState = useMemo(() => {
    if (initialViewState) {
      return initialViewState;
    } else if (features) {
      const coordinates = features
        .filter((feature): feature is MapLayerFeatureSection => feature.type === 'layer')
        .flatMap((feature) => feature.layers)
        .flatMap((layer) => layer.features)
        .map((geoFeature) => geoFeature.geometry.coordinates)
        .flat()
        .flat()
        .flat();

      if (coordinates.length > 0) {
        let minLat = Infinity;
        let maxLat = -Infinity;
        let minLng = Infinity;
        let maxLng = -Infinity;

        for (const [lng, lat] of coordinates) {
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
        }

        const centerLng = (minLng + maxLng) / 2;
        const centerLat = (minLat + maxLat) / 2;

        return {
          latitude: centerLat,
          longitude: centerLng,
          zoom: 12,
        };
      }
    }
  }, [initialViewState]);

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

  return (
    <MapContainer
      containerId={mapContainerId ?? 'map-container'}
      map={
        <MapBox
          clusterRadius={clusterRadius}
          containerId={mapContainerId ?? 'map-container'}
          controlBottomLeft={controlBottomLeft}
          controlTopRight={controlTopRight}
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
          mapViewStyle={mapViewStyle}
          markerGroups={markerGroups}
          onClickCanvas={onClickCanvas}
          setMapViewStyle={setMapViewStyle}
          token={token}
        />
      }
      drawer={
        <MapDrawer
          open={drawerOpen ?? false}
          onClose={() => setDrawerOpen?.(false)}
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
