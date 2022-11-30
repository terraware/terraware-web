import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactMapGL, { Layer, NavigationControl, Popup, Source } from 'react-map-gl';
import { MapOptions, MapPopupRenderer } from './MapModels';

/**
 * The following is needed to deal with a mapbox bug
 * See: https://docs.mapbox.com/mapbox-gl-js/guides/install/#transpiling
 */
import mapboxgl from 'mapbox-gl';
const mapboxImpl: any = mapboxgl;
// @tslint
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxImpl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default; /* tslint:disable-line */

const navControlStyle = {
  right: 10,
  bottom: 25,
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
};

export default function Map(props: MapProps): JSX.Element {
  const { token, onTokenExpired, options, popupRenderer, mapId, style } = props;
  const [geoData, setGeoData] = useState();
  const [layerIds, setLayerIds] = useState<string[]>([]);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [zoomBegin, setZoomBegin] = useState<boolean>(false);
  const [zoomEnd, setZoomEnd] = useState<boolean>(false);
  const mapRef = useRef<any | null>(null);

  const onMapLoad = useCallback(() => {
    const { bbox, sources } = options;
    const hasEntities = sources?.some((source) => {
      return source.entities?.some((entity) => entity?.boundary?.length);
    });

    // fit to bounding box if we have geometries
    if (hasEntities && mapRef?.current !== undefined) {
      const mapInstance: any = mapRef.current.getMap();
      setZoomEnd(false);
      setZoomBegin(true);
      mapInstance.fitBounds([bbox.lowerLeft, bbox.upperRight], { padding: 20 });
    }
  }, [options]);

  const onMapError = useCallback(
    (event: any) => {
      if (event?.error?.status === 401) {
        // tslint:disable-next-line: no-console
        console.error('Mapbox token expired');
        if (onTokenExpired) {
          setZoomEnd(false);
          onTokenExpired();
        }
      }
    },
    [onTokenExpired, setZoomEnd]
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
    }
  }, []);

  const onZoomEnd = () => {
    if (zoomBegin) {
      // if zoom end happens on our fitBounds call, mark zoom as ended
      // so we can start showing labels
      setZoomBegin(false);
      setZoomEnd(true);
    }
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
        {zoomEnd && geo.textAnnotation && <Layer {...geo.textAnnotation} />}
        {geo.layerOutline && <Layer {...geo.layerOutline} />}
        {geo.layer && <Layer {...geo.layer} />}
      </Source>
    ));

    return sources;
  }, [geoData, zoomEnd]);

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, height: '100%', minHeight: 250 }}>
      <ReactMapGL
        key={mapId}
        ref={mapRef}
        mapboxAccessToken={token}
        mapStyle='mapbox://styles/mapbox/satellite-v9?optimize=true'
        interactiveLayerIds={layerIds}
        onLoad={onMapLoad}
        onError={onMapError}
        onClick={onMapClick}
        onZoomEnd={onZoomEnd}
        style={style}
      >
        {mapSources}
        <NavigationControl showCompass={false} style={navControlStyle} position='bottom-right' />
        {popupInfo && popupRenderer && (
          <Popup
            anchor='top'
            longitude={Number(popupInfo.lng)}
            latitude={Number(popupInfo.lat)}
            onClose={() => setPopupInfo(null)}
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
