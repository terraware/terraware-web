import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactMapGL, { AttributionControl, Layer, NavigationControl, Popup, Source } from 'react-map-gl';
import { MapOptions, MapPopupRenderer } from './MapModels';

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
};

export default function Map(props: MapProps): JSX.Element {
  const { token, onTokenExpired, options, popupRenderer, mapId, style, bannerMessage } = props;
  const [geoData, setGeoData] = useState();
  const [layerIds, setLayerIds] = useState<string[]>([]);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [hoveredStateId, setHoveredStateId] = useState();
  const [clickedStateId, setClickedStateId] = useState();
  const mapRef = useRef(null);

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

  const onMapClick = useCallback((event: any) => {
    const { lat, lng } = event.lngLat;
    if (event?.features[0]?.properties) {
      const { properties } = event.features[0];
      setPopupInfo({
        lng,
        lat,
        properties,
      });
      setClickedStateId(properties.id);
    } else {
      setClickedStateId(undefined);
    }
  }, []);

  const onLoad = () => {
    const map: any = mapRef && mapRef.current;
    if (!map) {
      return;
    }
    const { sources } = options;
    sources
      .filter(source => source.isInteractive)
      .forEach(source => {
        map.on('mousemove', `${source.id}-fill`, (e: any) => {
          if (!e.features.length || !e.features[0].properties) {
            setHoveredStateId(undefined);
            return;
          }
          setHoveredStateId(e.features[0].properties.id);
        });
        map.on('mouseleave', `${source.id}-fill`, (e: any) => {
          setHoveredStateId(undefined);
        });
      });
  };

  useEffect(() => {
    const { sources } = options;
    if (geoData) {
      return;
    }

    /**
     * Initialize sources - we want ONE source per data type, eg. one source containing all geometries for zones.
     * Creating multiple sources, one per zone or one per plot, is unnecessarily and will create performance bottlenecks.
     * Leverage data-drive rendering using properties in the features and mapbox supported properties:
     *  eg. 'text-field': ['get', source.annotation.textField]
     */
    const geo = sources
      .map((source) => {
        const features = source.entities
          .map((data) => {
            if (!data.boundary || !Array.isArray(data.boundary)) {
              return null;
            }
            const multiPolygons = (data.boundary as number[][][][])
              .map((geom) => {
                if (!Array.isArray(geom)) {
                  return null;
                }
                return geom as number[][][];
              })
              .filter((geom) => !!geom) as number[][][][];

            if (!multiPolygons.length) {
              return null;
            }
            return multiPolygons.map((multiPolygon) => ({
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: multiPolygon,
              },
              properties: data.properties,
              id: data.id,
            }));
          })
          .filter((f) => f)
          .flatMap((f) => f);

        return {
          isInteractive: source.isInteractive,
          data: {
            type: 'FeatureCollection',
            features,
          },
          layer: {
            id: `${source.id}-fill`,
            type: 'fill',
            paint: {
              'fill-color': source.fillColor,
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

  const mapSources = useMemo(() => {
    if (!geoData) {
      return null;
    }
    const sources = (geoData as any[]).map((geo: any, index) => (
      <Source type='geojson' key={index} data={geo.data}>
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
              setClickedStateId(undefined);
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
