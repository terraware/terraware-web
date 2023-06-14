import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactMapGL, { AttributionControl, Layer, NavigationControl, Popup, Source } from 'react-map-gl';
import { MapSource, MapEntityId, MapEntityOptions, MapOptions, MapPopupRenderer, MapGeometry } from 'src/types/Map';
import { MapService } from 'src/services';

/**
 * The following is needed to deal with a mapbox bug
 * See: https://docs.mapbox.com/mapbox-gl-js/guides/install/#transpiling
 */
import mapboxgl from 'mapbox-gl';
import MapBanner from './MapBanner';
import { useIsVisible } from 'src/hooks/useIsVisible';
const mapboxImpl: any = mapboxgl;
// @tslint
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxImpl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default; /* tslint:disable-line */

type FeatureStateId = Record<string, Record<string, number | undefined>>;

const navControlStyle = {
  marginRight: '5px',
  marginBottom: '20px',
};

type PopupInfo = {
  lng: number;
  lat: number;
  properties: any;
  sourceId: string;
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
  bannerMessage?: string;
  // entity options
  entityOptions?: MapEntityOptions;
};

export default function Map(props: MapProps): JSX.Element {
  const { token, onTokenExpired, options, popupRenderer, mapId, style, bannerMessage, entityOptions } = props;
  const [geoData, setGeoData] = useState<any[]>();
  const [layerIds, setLayerIds] = useState<string[]>([]);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [deferredHighlightEntity, setDeferredHighlightEntity] = useState<MapEntityId[] | undefined>();
  const [deferredFocusEntity, setDeferredFocusEntity] = useState<MapEntityId[] | undefined>();
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const hoverStateId: FeatureStateId = useMemo(() => ({}), []);
  const selectStateId: FeatureStateId = useMemo(() => ({}), []);
  const highlightStateId: FeatureStateId = useMemo(() => ({}), []);
  const [firstVisible, setFirstVisible] = useState(false);
  const visible = useIsVisible(containerRef);

  useEffect(() => {
    // `firstVisible` detects when the box containing the map is first visible in the viewport. The map should only be
    // rendered if `firstVisible` is true. This accounts for cases in which the map is initially rendered hidden, and
    // is improperly resized when it first becomes visible.
    setFirstVisible((fv) => fv || visible);
  }, [visible]);

  const getFillColor = (source: MapSource, type: 'highlight' | 'select' | 'hover' | 'default') => {
    switch (type) {
      case 'highlight':
        return source.highlightFillColor || source.fillColor;
      case 'select':
        return source.selectFillColor || source.fillColor;
      case 'hover':
        return source.hoverFillColor || source.fillColor;
      default:
        return source.fillColor;
    }
  };

  const onMapError = useCallback(
    (event: any) => {
      if (event?.error?.status === 401) {
        // tslint:disable-next-line: no-console
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
      if (event?.features[0]?.properties) {
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
        const feature = foundSource.data.features.find((featureData: any) => featureData.id === entity.id);
        if (!feature) {
          return;
        }
        coordinates.push(feature.geometry.coordinates);
      });
      if (coordinates.length > 0) {
        const bbox = MapService.getBoundingBox([coordinates]);
        map.fitBounds([bbox.lowerLeft, bbox.upperRight], { padding: 20 });
      }
    },
    [geoData]
  );

  useEffect(() => {
    const map: any = mapRef && mapRef.current;
    if (!map) {
      return;
    }
    const { sources } = options;

    clearFeatureVar(hoverStateId);
    clearFeatureVar(selectStateId);
    clearFeatureVar(highlightStateId);

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
  }, [options, highlightStateId, selectStateId, hoverStateId, updateFeatureState]);

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
          id: source.id,
          isInteractive: source.isInteractive,
          data: {
            type: 'FeatureCollection',
            features,
          },
          layer: {
            id: `${source.id}-fill`,
            type: 'fill',
            paint: {
              'fill-color': [
                // Use a case-expression to decide which color to use for fill
                // see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#case
                // and, https://docs.mapbox.com/mapbox-gl-js/api/map/#map#setfeaturestate
                // if highlight, use highlight color
                // else if selected, use select color
                // else if hover, user hover color
                // else use default fill color
                'case',
                ['boolean', ['feature-state', 'highlight'], false],
                getFillColor(source, 'highlight'),
                ['boolean', ['feature-state', 'select'], false],
                getFillColor(source, 'select'),
                ['boolean', ['feature-state', 'hover'], false],
                getFillColor(source, 'hover'),
                getFillColor(source, 'default'),
              ],
            },
          },
          layerOutline: {
            id: `${source.id}-outline`,
            type: 'line',
            paint: {
              'line-color': source.lineColor,
              'line-width': source.lineWidth,
            },
          },
          textAnnotation: source.annotation
            ? {
                id: `${source.id}-annotation`,
                type: 'symbol',
                paint: {
                  'text-color': source.annotation.textColor,
                },
                layout: {
                  'text-allow-overlap': false,
                  'text-ignore-placement': false,
                  'text-field': ['get', source.annotation.textField],
                  'text-anchor': 'center',
                  'text-size': source.annotation.textSize,
                },
              }
            : null,
        };
      })
      .filter((g) => g);
    setGeoData(geo as any);
    if (popupRenderer) {
      setLayerIds(geo.filter((g: any) => g.isInteractive).map((g: any) => g.layer.id));
    }
  }, [options, setGeoData, token, popupRenderer]);

  const mapSources = useMemo(() => {
    if (!geoData) {
      return null;
    }
    const sources = (geoData as any[]).map((geo: any) => (
      <Source type='geojson' key={geo.id} data={geo.data} id={geo.id}>
        {geo.textAnnotation && <Layer {...geo.textAnnotation} />}
        {geo.layerOutline && <Layer {...geo.layerOutline} />}
        {geo.layer && <Layer {...geo.layer} />}
      </Source>
    ));

    return sources;
  }, [geoData]);

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
    }
  }, [drawFocusTo, entityOptions?.focus, geoData]);

  const hasEntities = options.sources?.some((source) => {
    return source.entities?.some((entity) => entity?.boundary?.length);
  });

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, height: '100%', minHeight: 250, position: 'relative' }} ref={containerRef}>
      {bannerMessage && <MapBanner message={bannerMessage} />}
      {firstVisible && (
        <ReactMapGL
          key={mapId}
          mapboxAccessToken={token}
          mapStyle='mapbox://styles/mapbox/satellite-v9?optimize=true'
          initialViewState={{
            bounds: hasEntities ? [options.bbox.lowerLeft, options.bbox.upperRight] : undefined,
            fitBoundsOptions: hasEntities ? { padding: 20 } : undefined,
          }}
          interactiveLayerIds={layerIds}
          onError={onMapError}
          onClick={onMapClick}
          style={style}
          attributionControl={false}
          onLoad={onLoad}
          ref={mapRef}
          onRender={(event) => event.target.resize()}
        >
          {mapSources}
          <NavigationControl showCompass={false} style={navControlStyle} position='bottom-right' />
          <AttributionControl compact={true} style={{ marginRight: '5px' }} />
          {popupInfo && popupRenderer && (
            <Popup
              anchor='top'
              longitude={Number(popupInfo.lng)}
              latitude={Number(popupInfo.lat)}
              onClose={() => {
                setPopupInfo(null);
                updateFeatureState(selectStateId, 'select', [{ sourceId: popupInfo.sourceId }]);
              }}
              style={popupRenderer.style}
              className={popupRenderer.className}
            >
              {popupRenderer.render(popupInfo.properties)}
            </Popup>
          )}
        </ReactMapGL>
      )}
    </Box>
  );
}
