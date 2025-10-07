import { MutableRefObject, useCallback, useMemo } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { MapBounds, MapViewState } from './types';
import { isBoundsValid } from './utils';

const useMapUtils = (mapRef: MutableRefObject<MapRef | null>) => {
  const jumpTo = useCallback(
    (viewState: MapViewState) => {
      const map = mapRef.current;
      const { latitude, longitude, zoom } = viewState;

      if (map) {
        map.jumpTo({
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

      if (map && isBoundsValid(bbox)) {
        map.fitBounds(
          [
            { lat: minLat, lng: minLng },
            { lat: maxLat, lng: maxLng },
          ],
          {
            animate: false,
          }
        );
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

  const getCurrentViewState = useCallback((): MapViewState | undefined => {
    const map = mapRef.current;

    if (map) {
      const center = map.getCenter();
      const zoom = map.getZoom();

      return {
        latitude: center.lat,
        longitude: center.lng,
        zoom,
      };
    }
  }, [mapRef]);

  return useMemo(
    () => ({
      jumpTo,
      fitBounds,
      getCurrentBounds,
      getCurrentViewState,
    }),
    [jumpTo, fitBounds, getCurrentBounds, getCurrentViewState]
  );
};

export default useMapUtils;
