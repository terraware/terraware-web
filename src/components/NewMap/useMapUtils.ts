import { MutableRefObject, useCallback, useMemo } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

const useMapUtils = (mapRef: MutableRefObject<MapRef | null>) => {
  const easeTo = useCallback(
    (latitude: number, longitude: number, zoom?: number) => {
      const map = mapRef.current;

      if (map) {
        map.easeTo({
          center: { lat: latitude, lng: longitude },
          zoom,
        });
      }
    },
    [mapRef]
  );

  const fitBounds = useCallback(
    (bbox: { minLat: number; minLng: number; maxLat: number; maxLng: number }) => {
      const map = mapRef.current;
      const { minLat, minLng, maxLat, maxLng } = bbox;

      if (map) {
        map.fitBounds([
          { lat: minLat, lng: minLng },
          { lat: maxLat, lng: maxLng },
        ]);
      }
    },
    [mapRef]
  );

  return useMemo(
    () => ({
      easeTo,
      fitBounds,
    }),
    [easeTo, fitBounds]
  );
};

export default useMapUtils;
