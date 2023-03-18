import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactMapGL, { AttributionControl, Layer, NavigationControl, Popup, Source } from 'react-map-gl';
import { MapSource, MapEntityId, MapEntityOptions, MapOptions, MapPopupRenderer } from 'src/types/Map';
import { MapService } from 'src/services';

/**
 * The following is needed to deal with a mapbox bug
 * See: https://docs.mapbox.com/mapbox-gl-js/guides/install/#transpiling
 */
import mapboxgl from 'mapbox-gl';
import MapBanner from './MapBanner';
const mapboxImpl: any = mapboxgl;
// @tslint
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxImpl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default; /* tslint:disable-line */

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
  const [deferredHighlightEntity, setDeferredHighlightEntity] = useState<MapEntityId | undefined>();
  const [deferredFocusEntity, setDeferredFocusEntity] = useState<MapEntityId | undefined>();
  const mapRef = useRef(null);
  const hoverStateId: { [key: string]: number | undefined } = useMemo(() => ({}), []);
  const selectStateId: { [key: string]: number | undefined } = useMemo(() => ({}), []);
  const highlightStateId: { [key: string]: number | undefined } = useMemo(() => ({}), []);

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

  const updateFeatureState = useCallback((featureVar: any, property: string, mapEntityId: MapEntityId) => {
    const map: any = mapRef && mapRef.current;
    if (!map) {
      return;
    }
    const { id, sourceId } = mapEntityId;
    // clear previous
    if (featureVar[sourceId] && id !== featureVar[sourceId]) {
      map.setFeatureState({ source: sourceId, id: featureVar[sourceId] }, { [property]: false });
    }
    // set new
    if (id) {
      map.setFeatureState({ source: sourceId, id }, { [property]: true });
    }
    featureVar[sourceId] = id;
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
        updateFeatureState(selectStateId, 'select', { sourceId, id });
      }
    },
    [updateFeatureState, selectStateId]
  );

  const drawFocusTo = useCallback(
    (mapEntity: MapEntityId) => {
      const map: any = mapRef?.current;
      if (!map || !mapEntity.id || !mapEntity.sourceId) {
        return;
      }
      const foundSource = geoData && geoData.find((geo) => geo.id === mapEntity.sourceId);
      if (!foundSource || !foundSource.data) {
        return;
      }
      const feature = foundSource.data.features.find((featureData: any) => featureData.id === mapEntity.id);
      if (!feature) {
        return;
      }
      const coordinates = feature.geometry.coordinates;
      const bbox = MapService.getBoundingBox([[coordinates]]);
      map.fitBounds([bbox.lowerLeft, bbox.upperRight], { padding: 20 });
    },
    [geoData]
  );

  const onLoad = () => {
    const map: any = mapRef && mapRef.current;
    if (!map) {
      return;
    }
    Object.keys(hoverStateId).forEach((key) => delete hoverStateId[key]);
    Object.keys(selectStateId).forEach((key) => delete selectStateId[key]);
    Object.keys(highlightStateId).forEach((key) => delete highlightStateId[key]);

    const { sources } = options;
    sources
      .filter((source) => source.isInteractive)
      .forEach((source) => {
        const layerId = `${source.id}-fill`;
        map.on('mousemove', layerId, (e: any) => {
          if (!e.features.length || !e.features[0].properties) {
            return;
          }
          const newId = e.features[0].id;
          updateFeatureState(hoverStateId, 'hover', { sourceId: source.id, id: newId });
        });
        map.on('mouseleave', `${source.id}-fill`, () => {
          updateFeatureState(hoverStateId, 'hover', { sourceId: source.id });
        });
      });

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
    if (geoData) {
      return;
    }

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
  }, [options, geoData, setGeoData, token, popupRenderer]);

  useEffect(() => {
    if (entityOptions?.highlight) {
      if (!mapRef || !mapRef.current) {
        setDeferredHighlightEntity(entityOptions?.highlight);
      } else {
        updateFeatureState(highlightStateId, 'highlight', entityOptions?.highlight);
      }
    }
  }, [entityOptions?.highlight, highlightStateId, updateFeatureState]);

  useEffect(() => {
    if (entityOptions?.focus) {
      if (!mapRef || !mapRef.current) {
        setDeferredFocusEntity(entityOptions?.focus);
      } else {
        drawFocusTo(entityOptions?.focus);
      }
    }
  }, [drawFocusTo, entityOptions?.focus]);

  const mapSources = useMemo(() => {
    if (!geoData) {
      return null;
    }
    const sources = (geoData as any[]).map((geo: any, index) => (
      <Source type='geojson' key={index} data={geo.data} id={geo.id}>
        {geo.textAnnotation && <Layer {...geo.textAnnotation} />}
        {geo.layerOutline && <Layer {...geo.layerOutline} />}
        {geo.layer && <Layer {...geo.layer} />}
      </Source>
    ));

    return sources;
  }, [geoData]);

  const hasEntities = options.sources?.some((source) => {
    return source.entities?.some((entity) => entity?.boundary?.length);
  });

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, height: '100%', minHeight: 250, position: 'relative' }}>
      {bannerMessage && <MapBanner message={bannerMessage} />}
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
              updateFeatureState(selectStateId, 'select', { sourceId: popupInfo.sourceId });
            }}
            style={popupRenderer.style}
            className={popupRenderer.className}
          >
            {popupRenderer.render(popupInfo.properties)}
          </Popup>
        )}
      </ReactMapGL>
    </Box>
  );
}
