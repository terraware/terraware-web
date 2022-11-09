import { Box } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export type MapProps = {
  token: string;
};

export default function MapComponent(props: MapProps): JSX.Element {
  const { token } = props;
  mapboxgl.accessToken = token;

  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng] = useState(-70.9);
  const [lat] = useState(42.35);
  const [zoom] = useState(9);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current || '',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom,
    });
  });

  return (
    <Box>
      <Box ref={mapContainer} sx={{ height: '400px' }} />
    </Box>
  );
}
