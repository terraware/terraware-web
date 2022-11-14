import { Box } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapOptions } from './MapModels';
import { getLatLng } from './MapUtils';

export type MapProps = {
  token: string;
  options: MapOptions;
  onTokenExpired?: () => void;
};

export default function Map(props: MapProps): JSX.Element {
  const { token, onTokenExpired, options } = props;

  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const { bbox, sources } = options;
    if (map.current) {
      // clean up map if we need to recreate it based on new props
      map.current.remove();
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current || '',
      style: 'mapbox://styles/mapbox/satellite-v9',
    });

    // show +/- zoom options only
    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    // initialize sources
    map.current.on('load', () => {
      sources.forEach((source) => {
        if (!source.boundary || !Array.isArray(source.boundary)) {
          return;
        }
        const multiPolygons = (source.boundary as (number | number[][][])[])
          .map((geom) => {
            if (!Array.isArray(geom)) {
              return null;
            }
            const g = geom as number[][][];
            return g.map((gg) => {
              return gg.map((coord) => getLatLng(coord[0], coord[1]));
            });
          })
          .filter((geom) => !!geom) as number[][][][];

        if (!multiPolygons.length) {
          return;
        }

        // add polygons
        map.current?.addSource(source.name, {
          type: 'geojson',
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
        });

        // add layer
        map.current?.addLayer({
          id: source.id,
          type: 'fill',
          source: source.name,
          paint: {
            'fill-color': source.fillColor,
            'fill-opacity': source.fillOpacity,
          },
          filter: ['==', '$type', 'Polygon'],
        });

        // add click event handler
        if (map.current !== null && source.onClick) {
          const mapInstance = map.current;
          const onClick = source.onClick;
          mapInstance.on('click', source.id, (e) => {
            new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(onClick()).addTo(mapInstance);
          });
        }
      });
    });

    // handle error
    map.current.on('error', (event: any) => {
      if (event?.error?.status === 401) {
        // tslint:disable-next-line: no-console
        console.error('Mapbox token expired');
        if (onTokenExpired) {
          onTokenExpired();
        }
      }
    });

    // fit to bounding box
    map.current.fitBounds([bbox.lowerLeft, bbox.upperRight], { padding: 20 });
  }, [token, onTokenExpired, options]);

  return (
    <Box>
      <Box ref={mapContainer} sx={{ height: '400px' }} />
    </Box>
  );
}
