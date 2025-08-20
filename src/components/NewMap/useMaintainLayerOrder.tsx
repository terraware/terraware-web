import { MutableRefObject, useEffect } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

/**
 * Ensures that all given layers maintain strict order in the Mapbox layer stack.
 */
export const useMaintainLayerOrder = (mapRef: MutableRefObject<MapRef | null>, orderedLayerIds: string[]) => {
  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    // Only move layers that exist
    const existingLayerIds = orderedLayerIds.filter((id) => map.getLayer(id));

    // Reverse iterate so first in array ends up lowest
    for (let i = existingLayerIds.length - 1; i >= 0; i--) {
      const layerId = existingLayerIds[i];
      try {
        map.moveLayer(layerId, i < existingLayerIds.length - 1 ? existingLayerIds[i + 1] : undefined);
      } catch (e) {
        // moveLayer will throw if layer doesn't exist in current style
      }
    }
  }, [mapRef, orderedLayerIds]);
};
