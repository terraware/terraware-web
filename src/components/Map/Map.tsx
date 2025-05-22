import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMapGL, {
  AttributionControl,
  FullscreenControl,
  Layer,
  MapRef,
  NavigationControl,
  Popup,
  Source,
} from 'react-map-gl';

import { Box, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

/**
 * The following is needed to deal with a mapbox bug
 * See: https://docs.mapbox.com/mapbox-gl-js/guides/install/#transpiling
 */
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { useIsVisible } from 'src/hooks/useIsVisible';
import { MapService } from 'src/services';
import {
  MapControl,
  MapEntityId,
  MapEntityOptions,
  MapGeometry,
  MapOptions,
  MapPopupRenderer,
  MapViewStyle,
  MapViewStyles,
  PopupInfo,
} from 'src/types/Map';
import useSnackbar from 'src/utils/useSnackbar';

import MapBanner from './MapBanner';
import MapViewStyleControl, { useMapViewStyle } from './MapViewStyleControl';
import { getMapDrawingLayer } from './utils';

const mapboxImpl: any = mapboxgl;
mapboxImpl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default; /* eslint-disable-line */

type FeatureStateId = Record<string, Record<string, number | undefined>>;

export type MapImage = {
  name: string;
  url: string;
};

const navControlStyle = {
  marginRight: '5px',
  marginBottom: '20px',
};

export type MapProps = {
  token: string;
  options: MapOptions;
  onTokenExpired?: () => void;
  popupRenderer?: MapPopupRenderer;
  // changes to mapId will re-create the map, needed for new token refreshes
  // since mapbox token is not reactive
  mapId?: string;
  // style overrides
  style?: object;
  mapViewStyle?: MapViewStyle;
  bannerMessage?: string;
  bottomRightLabel?: React.ReactNode;
  // entity options
  entityOptions?: MapEntityOptions;
  mapImages?: MapImage[];
} & MapControl;

export default function Map(props: MapProps): JSX.Element {
  const {
    token,
    onTokenExpired,
    options,
    popupRenderer,
    mapId,
    style,
    bannerMessage,
    bottomRightLabel,
    entityOptions,
    mapImages,
    hideFullScreen,
    topRightMapControl,
    bottomLeftMapControl,
    hideAllControls,
    disableZoom,
    mapViewStyle: initialMapViewStyle,
  } = props;
  const theme = useTheme();
  const [geoData, setGeoData] = useState<any[]>();
  const [layerIds, setLayerIds] = useState<string[]>([]);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [deferredHighlightEntity, setDeferredHighlightEntity] = useState<MapEntityId[] | undefined>();
  const [deferredFocusEntity, setDeferredFocusEntity] = useState<MapEntityId[] | undefined>();
  const mapRef = useRef<MapRef | null>(null);
  const containerRef = useRef(null);
  const hoverStateId: FeatureStateId = useMemo(() => ({}), []);
  const selectStateId: FeatureStateId = useMemo(() => ({}), []);
  const highlightStateId: FeatureStateId = useMemo(() => ({}), []);
  const [firstVisible, setFirstVisible] = useState<boolean>(false);
  const [resized, setResized] = useState<boolean>(false);
  const [mapViewStyle, onChangeMapViewStyle] = useMapViewStyle(initialMapViewStyle);
  const [reloadSources, setReloadSources] = useState(false);
  const visible = useIsVisible(containerRef);
  const snackbar = useSnackbar();

  useEffect(() => {
    // `firstVisible` detects when the box containing the map is first visible in the viewport. The map should only be
    // rendered if `firstVisible` is true. This accounts for cases in which the map is initially rendered hidden, and
    // is improperly resized when it first becomes visible.
    // A timeout was added to fix non-static height maps, which were also improperly resized on initial render.
    setTimeout(() => setFirstVisible((fv) => fv || visible), 200);
  }, [visible]);

  const loadImages = useCallback(
    (map: MapRef) => {
      mapImages?.forEach(({ name, url }) => {
        if (!map.hasImage(name)) {
          map.loadImage(url, (error, image) => {
            if (error || !image) {
              snackbar.toastError(error?.message ?? 'Error loading map image.');
            } else {
              map.addImage(name, image, { sdf: true });
            }
          });
        }
      });
    },
    [mapImages, snackbar]
  );

  const mapRefCb = useCallback(
    (map: MapRef | null) => {
      if (map !== null) {
        mapRef.current = map;

        // Load all needed map images here
        // It is done in the callbackRef to ensure the images are available quickly enough for the map layers to use
        // See https://github.com/visgl/react-map-gl/issues/1118#issuecomment-1139976172
        loadImages(map);
      }
    },
    [loadImages]
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

  const clearFeatureVar = (featureVar: any, property?: string) => {
    const map: any = mapRef && mapRef.current;

    Object.keys(featureVar).forEach((sourceId) => {
      Object.keys(featureVar[sourceId]).forEach((id) => {
        if (map && property) {
          map.setFeatureState({ source: sourceId, id: featureVar[sourceId][id] }, { [property]: false });
        }
      });
      delete featureVar[sourceId];
    });
  };

  const updateFeatureState = useCallback((featureVar: any, property: string, mapEntityId: MapEntityId[]) => {
    const map: any = mapRef && mapRef.current;
    if (!map) {
      return;
    }

    // clear previous features of this property
    clearFeatureVar(featureVar, property);

    // set new
    mapEntityId.forEach((entity) => {
      const { id, sourceId } = entity;
      if (!featureVar[sourceId]) {
        featureVar[sourceId] = {};
      }
      if (id) {
        map.setFeatureState({ source: sourceId, id }, { [property]: true });
        featureVar[sourceId][id] = id;
      }
    });
  }, []);

  const onMapClick = useCallback(
    (event: any) => {
      const { lat, lng } = event.lngLat;
      if (event?.features?.[0]?.properties) {
        const { id, properties, layer } = event.features[0];
        const sourceId = layer.id.replace(/-fill$/, '');
        setPopupInfo({
          lng,
          lat,
          properties,
          sourceId,
        });
        updateFeatureState(selectStateId, 'select', [{ sourceId, id }]);
      }
    },
    [updateFeatureState, selectStateId]
  );

  const drawFocusTo = useCallback(
    (mapEntity: MapEntityId[]) => {
      if (mapEntity.length <= 0) {
        return;
      }
      const map: any = mapRef?.current;
      if (!map) {
        return;
      }
      const coordinates: MapGeometry = [];
      mapEntity.forEach((entity) => {
        if (!entity.id || !entity.sourceId) {
          return;
        }
        const foundSource = geoData && geoData.find((geo) => geo.id === entity.sourceId);
        if (!foundSource || !foundSource.data) {
          return;
        }
        const features = foundSource.data.features.filter((featureData: any) => featureData.id === entity.id);
        features.forEach((feature: any) => {
          coordinates.push(feature.geometry.coordinates);
        });
      });
      if (coordinates.length > 0) {
        const bbox = MapService.getBoundingBox([coordinates]);
        // this is a hack to allow zooming to geometry while data is being updated, otherwise the zoom was not taking effect
        setTimeout(() => {
          map.fitBounds([bbox.lowerLeft, bbox.upperRight], { padding: 20, linear: true });
        }, 0);
      }
    },
    [geoData]
  );

  const zoomToFit = useCallback(() => {
    const map: any = mapRef?.current;
    map?.fitBounds([options.bbox.lowerLeft, options.bbox.upperRight], { padding: 20, linear: true });
  }, [options.bbox.lowerLeft, options.bbox.upperRight]);

  useEffect(() => {
    const map: any = mapRef && mapRef.current;
    if (!map) {
      return;
    }
    const { sources } = options;

    clearFeatureVar(hoverStateId);
    clearFeatureVar(highlightStateId);
    if (!popupInfo) {
      // don't clear select state if popup is open
      clearFeatureVar(selectStateId);
    }

    const mouseMoveCallbacks = sources
      .filter((source) => source.isInteractive)
      .map((source) => {
        const layerId = `${source.id}-fill`;
        return {
          [layerId]: (e: any) => {
            if (!e.features.length || !e.features[0].properties) {
              return;
            }
            const newId = e.features[0].id;
            updateFeatureState(hoverStateId, 'hover', [{ sourceId: source.id, id: newId }]);
          },
        };
      });

    const mouseLeaveCallbacks = sources
      .filter((source) => source.isInteractive)
      .map((source) => {
        const layerId = `${source.id}-fill`;
        return {
          [layerId]: () => {
            updateFeatureState(hoverStateId, 'hover', [{ sourceId: source.id }]);
          },
        };
      });

    mouseMoveCallbacks.forEach((cb) => {
      const layerId = Object.keys(cb)[0];
      map.on('mousemove', layerId, cb[layerId]);
    });
    mouseLeaveCallbacks.forEach((cb) => {
      const layerId = Object.keys(cb)[0];
      map.on('mouseleave', layerId, cb[layerId]);
    });

    return () => {
      mouseMoveCallbacks.forEach((cb) => {
        const layerId = Object.keys(cb)[0];
        map.off('mousemove', layerId, cb[layerId]);
      });
      mouseLeaveCallbacks.forEach((cb) => {
        const layerId = Object.keys(cb)[0];
        map.off('mouseleave', layerId, cb[layerId]);
      });
    };
  }, [options, highlightStateId, selectStateId, hoverStateId, popupInfo, updateFeatureState]);

  const onLoad = () => {
    if (deferredHighlightEntity) {
      updateFeatureState(highlightStateId, 'highlight', deferredHighlightEntity);
      setDeferredHighlightEntity(undefined);
    }
    if (deferredFocusEntity) {
      drawFocusTo(deferredFocusEntity);
      setDeferredFocusEntity(undefined);
    }
  };

  useEffect(() => {
    const { sources } = options;

    /**
     * Initialize sources - we want ONE source per data type, eg. one source containing all geometries for zones.
     * Creating multiple sources, one per zone or one per subzone, is unnecessarily and will create performance
     * bottlenecks. Leverage data-drive rendering using properties in the features and mapbox supported properties:
     *  eg. 'text-field': ['get', source.annotation.textField]
     */
    const geo = sources
      .map((source) => {
        const features = source.entities
          .map((entity) => {
            const multiPolygons = MapService.getMapEntityGeometry(entity);
            if (!multiPolygons.length) {
              return null;
            }
            return multiPolygons.map((multiPolygon) => ({
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: multiPolygon,
              },
              properties: entity.properties,
              id: entity.id,
            }));
          })
          .filter((f) => f)
          .flatMap((f) => f);

        return {
          data: { type: 'FeatureCollection', features },
          ...getMapDrawingLayer(source, source.id),
        };
      })
      .filter((g) => g);
    setGeoData(geo as any);
    if (popupRenderer) {
      setLayerIds(geo.filter((g: any) => g.isInteractive).map((g: any) => g.layer.id));
    }
  }, [options, setGeoData, token, popupRenderer]);

  const mapSources = useMemo(() => {
    if (mapImages && mapRef.current !== null && !mapRef.current?.hasImage(mapImages[0].name)) {
      loadImages(mapRef.current);
    }
    if (!geoData) {
      return null;
    }
    const sources = geoData.map((geo: any) => (
      <Source type='geojson' key={geo.id} data={geo.data} id={geo.id}>
        {geo.layer && <Layer {...geo.layer} />}
        {geo.patternFill && (
          <Layer {...geo.patternFill} beforeId={geo.textAnnotation ? geo.textAnnotation.id : undefined} />
        )}
        {geo.textAnnotation && <Layer {...geo.textAnnotation} beforeId={geo.layerOutline.id} />}
        {geo.layerOutline && <Layer {...geo.layerOutline} />}
      </Source>
    ));

    return sources;
  }, [mapImages, geoData, loadImages]);

  useEffect(() => {
    if (entityOptions?.highlight) {
      if (!mapRef || !mapRef.current) {
        setDeferredHighlightEntity(entityOptions?.highlight);
      } else {
        updateFeatureState(highlightStateId, 'highlight', entityOptions?.highlight);
      }
    }
  }, [entityOptions?.highlight, highlightStateId, updateFeatureState, mapSources]);

  useEffect(() => {
    if (entityOptions?.focus) {
      if (!mapRef || !mapRef.current) {
        setDeferredFocusEntity(entityOptions?.focus);
      } else {
        drawFocusTo(entityOptions?.focus);
      }
    } else {
      zoomToFit();
    }
  }, [drawFocusTo, entityOptions?.focus, geoData, zoomToFit]);

  const hasEntities = options.sources?.some((source) => {
    return source.entities?.some((entity) => entity?.boundary?.length);
  });

  const renderedPopup = useMemo<JSX.Element | null>(() => {
    if (!popupInfo || !popupRenderer) {
      return null;
    }
    return popupRenderer.render(popupInfo.properties);
  }, [popupInfo, popupRenderer]);

  // keep track of map being destroyed, this is not bound by react event loop
  let destroying = false;

  const onStyleDataHandler = () => {
    setReloadSources(!reloadSources);
  };

  return (
    <Box
      ref={containerRef}
      sx={[
        { display: 'flex', flexGrow: 1, height: '100%', minHeight: 250, position: 'relative' },
        // popup renderer sx styles are applied to the container because the Popup component
        // doesn't support the sx prop
        ...(Array.isArray(popupRenderer?.sx) ? popupRenderer.sx : [popupRenderer?.sx]),
      ]}
    >
      {bannerMessage && <MapBanner message={bannerMessage} />}
      {firstVisible && (
        <ReactMapGL
          key={mapId}
          mapboxAccessToken={token}
          mapStyle={MapViewStyles[mapViewStyle]}
          initialViewState={{
            bounds: hasEntities ? [options.bbox.lowerLeft, options.bbox.upperRight] : undefined,
            fitBoundsOptions: hasEntities ? { padding: 20 } : undefined,
          }}
          interactiveLayerIds={layerIds}
          onError={onMapError}
          onClick={onMapClick}
          style={style}
          onStyleData={onStyleDataHandler}
          attributionControl={false}
          onLoad={onLoad}
          onRemove={() => {
            destroying = true;
          }}
          ref={mapRefCb}
          onRender={(event) => {
            if (!resized) {
              setResized(true);
              event.target.resize();
            }
          }}
          scrollZoom={!disableZoom}
          doubleClickZoom={!disableZoom}
        >
          {mapSources}
          {!hideAllControls && (
            <NavigationControl showCompass={false} style={navControlStyle} position='bottom-right' />
          )}
          {!hideFullScreen && !hideAllControls && <FullscreenControl position='top-left' />}
          {!hideAllControls && <AttributionControl compact={true} style={{ marginRight: '5px' }} position='top-left' />}
          {!hideAllControls && <ZoomToFitControl onClick={zoomToFit} />}
          {!hideAllControls && (
            <MapViewStyleControl mapViewStyle={mapViewStyle} onChangeMapViewStyle={onChangeMapViewStyle} />
          )}
          {bottomRightLabel && (
            <div
              style={{
                height: 'max-content',
                position: 'absolute',
                right: theme.spacing(2),
                bottom: theme.spacing(2),
                width: 'max-content',
                zIndex: 1000,
              }}
            >
              {bottomRightLabel}
            </div>
          )}
          {popupInfo && popupRenderer && renderedPopup && (
            <Popup
              key={popupInfo.lat + popupInfo.lng}
              anchor={popupRenderer.anchor ?? 'top'}
              longitude={Number(popupInfo.lng)}
              latitude={Number(popupInfo.lat)}
              onClose={() => {
                if (destroying) {
                  return; // otherwise errors out updating feature state while map is being destroyed
                }
                setPopupInfo(null);
                updateFeatureState(selectStateId, 'select', [{ sourceId: popupInfo.sourceId }]);
              }}
              style={popupRenderer.style}
              className={popupRenderer.className}
            >
              {renderedPopup}
            </Popup>
          )}
          {topRightMapControl && !hideAllControls && (
            <div
              style={{
                height: 'max-content',
                position: 'absolute',
                right: theme.spacing(2),
                top: theme.spacing(2),
                width: 'max-content',
                zIndex: 1000,
              }}
            >
              {topRightMapControl}
            </div>
          )}
          {bottomLeftMapControl && !hideAllControls && (
            <div
              style={{
                height: 'max-content',
                position: 'absolute',
                left: theme.spacing(2),
                bottom: theme.spacing(4),
                width: 'max-content',
                zIndex: 1000,
              }}
            >
              {bottomLeftMapControl}
            </div>
          )}
        </ReactMapGL>
      )}
    </Box>
  );
}

type ZoomToFitControlProps = {
  onClick: () => void;
};

const ZoomToFitControl = ({ onClick }: ZoomToFitControlProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: '84px',
        right: '5px',
        zIndex: 10,
        width: 28,
        height: 28,
        backgroundColor: `${theme.palette.TwClrBaseWhite}`,
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', height: '18px' }} onClick={onClick}>
        <Icon name='iconFullScreen' />
      </button>
    </Box>
  );
};
