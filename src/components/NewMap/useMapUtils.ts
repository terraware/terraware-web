import { MutableRefObject, useCallback, useMemo } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

export type MapBounds = { minLat: number; minLng: number; maxLat: number; maxLng: number };

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
    (bbox: MapBounds) => {
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

  const getCurrentBounds = useCallback((): MapBounds | undefined => {
    const bound = mapRef?.current?.getBounds();
    if (bound) {
      return {
        minLat: bound.getSouth(),
        maxLat: bound.getNorth(),
        minLng: bound.getWest(),
        maxLng: bound.getEast(),
      };
    }
  }, [mapRef]);

  return useMemo(
    () => ({
      easeTo,
      fitBounds,
      getCurrentBounds,
    }),
    [easeTo, fitBounds, getCurrentBounds]
  );
};

export default useMapUtils;
