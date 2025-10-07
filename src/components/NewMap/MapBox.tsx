import React, { MutableRefObject, useCallback, useEffect, useMemo, useState } from 'react';
import Map, {
  FullscreenControl,
  Layer,
  MapRef,
  Marker,
  MarkerEvent,
  NavigationControl,
  Source,
  ViewStateChangeEvent,
} from 'react-map-gl/mapbox';

import { Box, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';
import { Feature, FeatureCollection } from 'geojson';
import { FilterSpecification, MapMouseEvent, Point } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import useDeviceInfo from 'src/utils/useDeviceInfo';

import MapViewStyleControl from './MapViewStyleControl';
import {
  MapCursor,
  MapHighlightGroup,
  MapLayer,
  MapMarker,
  MapMarkerGroup,
  MapProperties,
  MapViewStyle,
  stylesUrl,
} from './types';
import { useMaintainLayerOrder } from './useMaintainLayerOrder';

export type MapBoxProps = {
  clusterMaxZoom?: number;
  clusterRadius?: number;
  containerId?: string;
  controlBottomLeft?: React.ReactNode;
  controlTopRight?: React.ReactNode;
  controlTopLeft?: React.ReactNode;
  cursorInteract?: MapCursor;
  cursorMap?: MapCursor;
  disableDoubleClickZoom?: boolean;
  disableZoom?: boolean;
  drawerOpen?: boolean; // Used to trigger resize
  hideFullScreenControl?: boolean;
  hideMapViewStyleControl?: boolean;
  hideZoomControl?: boolean;
  highlightGroups?: MapHighlightGroup[];
  initialViewState?: {
    latitude?: number;
    longitude?: number;
    zoom?: number;
  };
  layers?: MapLayer[];
  mapId: string;
  mapImageUrls?: string[];
  mapRef: MutableRefObject<MapRef | null>;
  mapViewStyle: MapViewStyle;
  markerGroups?: MapMarkerGroup[];
  onClickCanvas?: (event: MapMouseEvent) => void;
  onMapMove?: (view: ViewStateChangeEvent) => void;
  onTokenExpired?: () => void;
  setMapViewStyle: (style: MapViewStyle) => void;
  token: string;
};

const MapBox = (props: MapBoxProps): JSX.Element => {
  const {
    clusterMaxZoom,
    clusterRadius,
    containerId,
    controlBottomLeft,
    controlTopRight,
    controlTopLeft,
    cursorInteract,
    cursorMap,
    disableDoubleClickZoom,
    disableZoom,
    drawerOpen,
    layers: featureGroups,
    hideFullScreenControl,
    hideMapViewStyleControl,
    hideZoomControl,
    highlightGroups,
    initialViewState,
    mapId,
    mapImageUrls,
    mapRef,
    mapViewStyle,
    markerGroups,
    onClickCanvas,
    onMapMove,
    onTokenExpired,
    setMapViewStyle,
    token,
  } = props;
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();
  const [cursor, setCursor] = useState<MapCursor>('auto');
  const [hoverFeatureId, setHoverFeatureId] = useState<string>();
  const [zoom, setZoom] = useState<number>();

  const loadImages = useCallback(
    (map: MapRef) => {
      mapImageUrls?.forEach((url) => {
        if (!map.hasImage(url)) {
          map.loadImage(url, (_error, image) => {
            if (image) {
              map.addImage(url, image, { sdf: true });
            }
          });
        }
      });
    },
    [mapImageUrls]
  );

  const mapRefCallback = useCallback(
    (map: MapRef | null) => {
      if (map !== null) {
        mapRef.current = map;
        setZoom(map.getZoom());
        loadImages(map);
      }
    },
    [loadImages, mapRef]
  );

  const onMove = useCallback(
    (view: ViewStateChangeEvent) => {
      setZoom(view.viewState.zoom);
      onMapMove?.(view);
    },
    [onMapMove]
  );

  const clusterMarkers = useCallback(
    (map: MapRef | null, markers: MapMarker[]): MapMarker[][] => {
      if (!map || map.getZoom() > (clusterMaxZoom ?? 20)) {
        // Too zoomed in. Return all marker as is
        return markers.map((marker) => [marker]);
      }

      const visited = new Set<string>();
      const markerPixels: Record<string, Point> = {};
      markers.forEach((marker) => {
        markerPixels[marker.id] = map.project({
          lat: marker.latitude,
          lon: marker.longitude,
        });
      });

      const clusters: MapMarker[][] = [];

      markers.forEach((marker, idx) => {
        if (!visited.has(marker.id)) {
          const cluster = [marker];
          markers.slice(idx + 1).forEach((otherMarker) => {
            if (!visited.has(otherMarker.id)) {
              const dx = markerPixels[marker.id].x - markerPixels[otherMarker.id].x;
              const dy = markerPixels[marker.id].y - markerPixels[otherMarker.id].y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist <= (clusterRadius ?? 40)) {
                cluster.push(otherMarker);
                visited.add(otherMarker.id);
              }
            }
          });
          clusters.push(cluster);
        }
      });

      return clusters;
    },
    [clusterMaxZoom, clusterRadius]
  );

  // Find all layers with at least some clickable elements
  const interactiveLayerIds = useMemo(() => {
    return featureGroups
      ?.filter((group) => group.features.some((feature) => feature.onClick !== undefined))
      ?.map((group) => group.layerId);
  }, [featureGroups]);

  const geojson = useMemo((): FeatureCollection | undefined => {
    const features = featureGroups?.flatMap((group) => {
      return group.features.map((feature): Feature => {
        const properties: MapProperties = {
          id: feature.featureId,
          clickable: feature.onClick !== undefined,
          label: feature.label,
          layerFeatureId: `${group.layerId}/${feature.featureId}`,
          layerId: group.layerId,
          priority: feature.priority ?? 0,
          selected: feature.selected ?? false,
        };

        return {
          type: 'Feature',
          geometry: feature.geometry,
          properties,
        };
      });
    });

    return features
      ? {
          type: 'FeatureCollection',
          features,
        }
      : undefined;
  }, [featureGroups]);

  const { borderLayers, fillLayers, textLayers } = useMemo(() => {
    const _borderLayers = featureGroups?.map((group) => {
      return (
        <Layer
          key={`${group.layerId}-border`}
          id={`${group.layerId}-border`}
          source={'mapData'}
          type='line'
          paint={{
            'line-color': group.style.borderColor,
            'line-width': 2,
          }}
          filter={['==', ['get', 'layerId'], group.layerId]}
        />
      );
    });

    const _fillLayers = featureGroups?.flatMap((group) => {
      const opacity = Math.min(0.4, group.style.opacity ?? 0.2);
      const selectedOpacity = opacity * 2;
      const hoverOpacity = opacity * 1.5;
      const hoverAndSelectedOpacity = opacity * 2.5;

      const groupFilter: FilterSpecification = ['==', ['get', 'layerId'], group.layerId];

      const clickableFilter: FilterSpecification = ['==', ['get', 'clickable'], true];

      const selectedFilter: FilterSpecification = ['==', ['get', 'selected'], true];
      const notSelectedFilter: FilterSpecification = ['==', ['get', 'selected'], false];

      const hoverFilter: FilterSpecification = ['==', ['get', 'id'], hoverFeatureId ?? null];
      const notHoverFilter: FilterSpecification = ['!=', ['get', 'id'], hoverFeatureId ?? null];

      return [
        /* Base fill. This layer is clickable */
        <Layer
          key={group.layerId}
          id={group.layerId}
          source={'mapData'}
          type={'fill'}
          paint={{ 'fill-opacity': 0 }}
          filter={['all', groupFilter, clickableFilter]}
        />,
        /* Fill for base layer */
        <Layer
          key={`${group.layerId}-unselected`}
          id={`${group.layerId}-unselected`}
          source={'mapData'}
          type={'fill'}
          paint={
            group.style.fillPatternUrl
              ? {
                  'fill-pattern': group.style.fillPatternUrl,
                  'fill-opacity': opacity,
                }
              : {
                  'fill-color': group.style.fillColor,
                  'fill-opacity': opacity,
                }
          }
          filter={['all', groupFilter, notSelectedFilter, notHoverFilter]}
        />,
        /* Fill for seleced layer */
        <Layer
          key={`${group.layerId}-selected`}
          id={`${group.layerId}-selected`}
          slot={'bottom'}
          source={'mapData'}
          type={'fill'}
          paint={
            group.style.fillPatternUrl
              ? {
                  'fill-pattern': group.style.fillPatternUrl,
                  'fill-opacity': selectedOpacity,
                }
              : {
                  'fill-color': group.style.fillColor,
                  'fill-opacity': selectedOpacity,
                }
          }
          filter={['all', groupFilter, selectedFilter, notHoverFilter]}
        />,
        /* Fill for hover layer */
        <Layer
          key={`${group.layerId}-hover`}
          id={`${group.layerId}-hover`}
          source={'mapData'}
          type={'fill'}
          paint={
            group.style.fillPatternUrl
              ? {
                  'fill-pattern': group.style.fillPatternUrl,
                  'fill-opacity': hoverOpacity,
                }
              : {
                  'fill-color': group.style.fillColor,
                  'fill-opacity': hoverOpacity,
                }
          }
          filter={['all', groupFilter, hoverFilter, notSelectedFilter]}
        />,
        /* Fill for hover and selected layer */
        <Layer
          key={`${group.layerId}-selected-hover`}
          id={`${group.layerId}-selected-hover`}
          source={'mapData'}
          type={'fill'}
          paint={
            group.style.fillPatternUrl
              ? {
                  'fill-pattern': group.style.fillPatternUrl,
                  'fill-opacity': hoverAndSelectedOpacity,
                }
              : {
                  'fill-color': group.style.fillColor,
                  'fill-opacity': hoverAndSelectedOpacity,
                }
          }
          filter={['all', groupFilter, hoverFilter, selectedFilter]}
        />,
      ];
    });

    const _textLayers = featureGroups?.map((group) => {
      const groupFilter: FilterSpecification = ['==', ['get', 'layerId'], group.layerId];
      const labelFilter: FilterSpecification = ['has', 'label'];

      return (
        <Layer
          key={`${group.layerId}-label`}
          id={`${group.layerId}-label`}
          source={'mapData'}
          type={'symbol'}
          layout={{
            'text-allow-overlap': false,
            'text-anchor': 'center',
            'text-field': ['get', 'label'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Regular'],
            'text-ignore-placement': false,
            'text-justify': 'center',
            'text-size': 14,
          }}
          paint={{
            'text-color': '#ffffff',
          }}
          filter={['all', groupFilter, labelFilter]}
        />
      );
    });

    return {
      borderLayers: _borderLayers ?? [],
      fillLayers: _fillLayers ?? [],
      textLayers: _textLayers ?? [],
    };
  }, [featureGroups, hoverFeatureId]);

  const highlightLayers = useMemo(() => {
    return (
      highlightGroups?.flatMap((group) => {
        if (!group.visible) {
          return [];
        }
        return group.highlights
          .map((highlight, index) => {
            const highlightFeatureIds = highlight.featureIds.map(({ layerId, featureId }) => `${layerId}/${featureId}`);

            if (highlightFeatureIds.length) {
              return (
                <Layer
                  key={`highlight-${group.highlightId}-${index}`}
                  id={`highlight-${group.highlightId}-${index}`}
                  source={'mapData'}
                  type={'fill'}
                  paint={
                    highlight.style.fillPatternUrl
                      ? {
                          'fill-pattern': highlight.style.fillPatternUrl,
                          'fill-opacity': highlight.style.opacity ?? 0.5,
                        }
                      : {
                          'fill-color': highlight.style.fillColor,
                          'fill-opacity': highlight.style.opacity ?? 0.5,
                        }
                  }
                  filter={[
                    'all',
                    ['has', 'layerFeatureId'],
                    ['match', ['get', 'layerFeatureId'], highlightFeatureIds, true, false],
                  ]}
                />
              );
            }
          })
          .filter((layer): layer is JSX.Element => layer !== undefined);
      }) ?? []
    );
  }, [highlightGroups]);

  const onMarkerClick = useCallback(
    (marker: MapMarker) => (event: MarkerEvent<MouseEvent>) => {
      marker.onClick?.();
      event.originalEvent.stopPropagation();
    },
    []
  );

  const onMarkerClusterClick = useCallback(
    (latitude: number, longitude: number) => (event: MarkerEvent<MouseEvent>) => {
      mapRef.current?.easeTo({
        center: { lat: latitude, lon: longitude },
        zoom: (zoom ?? 10) + 1,
        duration: 500,
      });
      event.originalEvent.stopPropagation();
    },
    [mapRef, zoom]
  );

  const markersComponents = useMemo(() => {
    return markerGroups?.flatMap((markerGroup) => {
      if (!markerGroup.visible) {
        return [];
      }

      // cluster markers here
      const clusteredMarkers = clusterMarkers(mapRef.current, markerGroup.markers);

      return clusteredMarkers.map((markers, i) => {
        if (markers.length === 1) {
          const marker = markers[0];

          return (
            <Marker
              className='map-marker'
              key={`group-${markerGroup.markerGroupId}-marker-${i}`}
              longitude={marker.longitude}
              latitude={marker.latitude}
              anchor='center'
              onClick={onMarkerClick(marker)}
              style={{ backgroundColor: marker.selected ? markerGroup.style.iconColor : theme.palette.TwClrBg }}
            >
              <Icon
                fillColor={marker.selected ? theme.palette.TwClrBg : markerGroup.style.iconColor}
                name={markerGroup.style.iconName}
                size={'small'}
              />
            </Marker>
          );
        } else if (markers.length > 1) {
          const latSum = markers.reduce((sum, marker) => sum + marker.latitude, 0);
          const lngSum = markers.reduce((sum, marker) => sum + marker.longitude, 0);
          const latAvg = latSum / markers.length;
          const lngAvg = lngSum / markers.length;

          const selected = markers.some((marker) => marker.selected);

          return (
            <Marker
              className='map-marker map-marker--cluster'
              key={`group-${markerGroup.markerGroupId}-marker-cluster-${i}`}
              longitude={lngAvg}
              latitude={latAvg}
              anchor='center'
              onClick={onMarkerClusterClick(latAvg, lngAvg)}
              style={{ backgroundColor: selected ? markerGroup.style.iconColor : theme.palette.TwClrBg }}
            >
              <p className='count'>{markers.length}</p>
              <Icon
                fillColor={selected ? theme.palette.TwClrBg : markerGroup.style.iconColor}
                name={markerGroup.style.iconName}
                size={'small'}
              />
            </Marker>
          );
        }
      });
    });
  }, [clusterMarkers, markerGroups, mapRef, onMarkerClick, onMarkerClusterClick, theme]);

  const onMouseMove = useCallback((event: MapMouseEvent) => {
    if (event.features && event.features.length) {
      const properties = event.features
        .map((feature) => feature.properties)
        .filter(
          (featureProperties): featureProperties is MapProperties =>
            featureProperties &&
            featureProperties.id !== undefined &&
            featureProperties.priority !== undefined &&
            featureProperties.clickable
        );

      if (properties.length) {
        const topPriorityFeature = properties.reduce((top, current) => {
          return current.priority > top.priority ? current : top;
        }, properties[0]);
        setHoverFeatureId(topPriorityFeature.id);

        return;
      }
    }
    setHoverFeatureId(undefined);
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }
    const observer = new ResizeObserver(() => {
      mapRef.current?.resize();
    });
    observer.observe(mapRef.current.getContainer());

    return () => observer.disconnect();
  }, [mapRef]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.resize();
  }, [drawerOpen, mapRef]);

  // Hovering interactive layers
  const onMouseEnter = useCallback(() => setCursor(cursorInteract ?? 'pointer'), [cursorInteract]);
  const onMouseLeave = useCallback(() => setCursor('auto'), []);

  // Entering and exiting canvases
  const onMouseOver = useCallback(() => setCursor(cursorMap ?? 'auto'), [cursorMap]);
  const onMouseOut = useCallback(() => setCursor('auto'), []);

  // On layer click
  const onMapClick = useCallback(
    (event: MapMouseEvent) => {
      if (featureGroups && event.features?.length) {
        const properties = event.features
          .map((feature) => feature.properties)
          .filter(
            (featureProperties): featureProperties is MapProperties =>
              featureProperties &&
              featureProperties.id !== undefined &&
              featureProperties.priority !== undefined &&
              featureProperties.clickable
          );

        if (properties.length) {
          const topPriorityFeature = properties.reduce((top, current) => {
            return current.priority > top.priority ? current : top;
          }, properties[0]);

          const clickedItem = featureGroups
            .flatMap((group) => group.features)
            .find((feature) => feature.featureId === topPriorityFeature.id);
          if (clickedItem && clickedItem.onClick) {
            clickedItem.onClick();

            return;
          }
        }
        // If feature not clickable or not handled, fall through to canvas
      }

      if (onClickCanvas !== undefined) {
        onClickCanvas(event);
      }
    },
    [featureGroups, onClickCanvas]
  );

  const onMapError = useCallback(
    (event: any) => {
      if (event?.error?.status === 401) {
        // eslint-disable-next-line no-console
        console.error('Mapbox token expired');
        if (onTokenExpired) {
          onTokenExpired();
        }
      }
    },
    [onTokenExpired]
  );

  const orderedLayerIds = useMemo(() => {
    return [
      ...fillLayers.map((layer) => layer.props.id),
      ...highlightLayers.map((layer) => layer.props.id),
      ...borderLayers.map((layer) => layer.props.id),
      ...textLayers.map((layer) => layer.props.id),
    ] as string[];
  }, [borderLayers, fillLayers, highlightLayers, textLayers]);

  useMaintainLayerOrder(mapRef, orderedLayerIds);

  return (
    <Map
      key={mapId}
      attributionControl={false}
      cursor={cursor}
      doubleClickZoom={!disableZoom && !disableDoubleClickZoom}
      interactiveLayerIds={interactiveLayerIds}
      initialViewState={initialViewState}
      mapboxAccessToken={token}
      mapStyle={stylesUrl[mapViewStyle]}
      ref={mapRefCallback}
      scrollZoom={!disableZoom}
      style={{ width: 'auto', height: isDesktop ? 'auto' : '80vh', flexGrow: isDesktop ? 1 : undefined }}
      onClick={onMapClick}
      onError={onMapError}
      onMove={onMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onMouseMove={onMouseMove}
    >
      {isDesktop && !hideFullScreenControl && <FullscreenControl position='top-left' containerId={containerId} />}
      {!hideZoomControl && (
        <NavigationControl
          showCompass={false}
          style={{
            marginRight: theme.spacing(2),
            marginBottom: theme.spacing(2),
          }}
          position='bottom-right'
        />
      )}
      {!hideMapViewStyleControl && (
        <MapViewStyleControl containerId={containerId} mapViewStyle={mapViewStyle} setMapViewStyle={setMapViewStyle} />
      )}
      {controlTopLeft && (
        <Box
          sx={{
            height: 'max-content',
            position: 'absolute',
            left: '136px',
            top: '10px',
            width: 'max-content',
            zIndex: 1000,
          }}
        >
          {controlTopLeft}
        </Box>
      )}
      {controlTopRight && (
        <Box
          sx={{
            height: 'max-content',
            position: 'absolute',
            right: theme.spacing(2),
            top: theme.spacing(2),
            width: 'max-content',
            zIndex: 1000,
          }}
        >
          {controlTopRight}
        </Box>
      )}
      {controlBottomLeft && (
        <Box
          style={{
            height: 'max-content',
            position: 'absolute',
            left: theme.spacing(2),
            bottom: theme.spacing(4),
            width: 'max-content',
            zIndex: 1000,
          }}
        >
          {controlBottomLeft}
        </Box>
      )}
      {geojson && (
        <Source id='mapData' type='geojson' data={geojson}>
          {fillLayers}
          {highlightLayers}
          {borderLayers}
          {textLayers}
        </Source>
      )}
      {markersComponents}
    </Map>
  );
};

export default MapBox;
