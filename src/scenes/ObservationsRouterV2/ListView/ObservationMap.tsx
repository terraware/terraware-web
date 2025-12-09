import React, { useRef } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import MapComponent from 'src/components/NewMap';
import useMapboxToken from 'src/utils/useMapboxToken';

const ObservationMap = () => {
  const { mapId, token } = useMapboxToken();
  const mapRef = useRef<MapRef | null>(null);

  return <MapComponent mapId={mapId} mapRef={mapRef} token={token ?? ''} />;
};

export default ObservationMap;
