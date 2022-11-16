import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactMapGL, { Layer, NavigationControl, Popup, Source } from 'react-map-gl';
import { MapOptions } from './MapModels';
import { useRenderFeature } from './MapRenderUtils';

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
  enablePopup?: boolean;
  // changes to mapId will re-create the map, needed for new token refreshes
  // since mapbox token is not reactive
  mapId?: string;
};

export default function Map(props: MapProps): JSX.Element {
  const { token, onTokenExpired, options, enablePopup, mapId } = props;
  const [geoData, setGeoData] = useState();
  const [layerIds, setLayerIds] = useState<string[]>([]);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const mapRef = useRef<any | null>(null);
  const renderFeature = useRenderFeature();

  const onMapLoad = useCallback(() => {
    const { bbox } = options;
    // fit to bounding box
    if (mapRef?.current !== undefined) {
      const mapInstance: any = mapRef.current.getMap();
      mapInstance.fitBounds([bbox.lowerLeft, bbox.upperRight], { padding: 20 });
    }
  }, [options]);

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
    }
  }, []);

  useEffect(() => {
    const { sources } = options;
    if (geoData) {
      return;
    }
    // initialize sources
    const geo = sources
      .map((source) => {
        if (!source.boundary || !Array.isArray(source.boundary)) {
          return null;
        }
        const multiPolygons = (source.boundary as (number | number[][][])[])
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

        return {
          data: {
            type: 'FeatureCollection',
            features: multiPolygons.map((multiPolygon) => {
              return {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: multiPolygon,
                },
                properties: source.metadata,
              };
            }),
          },
          layer: {
            id: source.id,
            type: 'fill',
            paint: {
              'fill-color': source.fillColor,
              'fill-opacity': source.fillOpacity,
            },
          },
        };
      })
      .filter((g) => g);
    setGeoData(geo as any);
    if (enablePopup) {
      setLayerIds(geo.map((g: any) => g.layer.id));
    }
  }, [options, geoData, setGeoData, token, enablePopup]);

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, height: '100%', minHeight: 250 }}>
      <ReactMapGL
        key={mapId}
        ref={mapRef}
        mapboxAccessToken={token}
        mapStyle='mapbox://styles/mapbox/satellite-v9'
        interactiveLayerIds={layerIds}
        onLoad={onMapLoad}
        onError={onMapError}
        onClick={onMapClick}
      >
        {geoData &&
          (geoData as any[]).map((geo: any, index) => (
            <Source type='geojson' key={index} data={geo.data}>
              <Layer {...geo.layer} />
            </Source>
          ))}
        <NavigationControl showCompass={false} style={navControlStyle} position='bottom-right' />
        {popupInfo && (
          <Popup
            anchor='top'
            longitude={Number(popupInfo.lng)}
            latitude={Number(popupInfo.lat)}
            onClose={() => setPopupInfo(null)}
          >
            {renderFeature(popupInfo.properties)}
          </Popup>
        )}
      </ReactMapGL>
    </Box>
  );
}
