import { useCallback, useEffect, useState } from 'react';
import { Feature, GeoJsonProperties, Geometry, Polygon, MultiPolygon } from 'geojson';
import { MapRef, useControl } from 'react-map-gl';
import MapboxDraw, { DrawCreateEvent, DrawUpdateEvent } from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import intersect from '@turf/intersect';
import difference from '@turf/difference';

export type GeometryFeature = Feature<Polygon | MultiPolygon, GeoJsonProperties>;

type SplitPolygonProps = ConstructorParameters<typeof MapboxDraw>[0] & {
  features: GeometryFeature[];
  setFeatures: (features: GeometryFeature[]) => void;
};

const defaultProps = {
  controls: {
    polygon: true,
    trash: true,
  },
  displayControlsDefault: false,
};

function toMultiPolygon(geometry: Geometry): MultiPolygon | null {
  if (geometry.type === 'MultiPolygon') {
    return geometry;
  } else if (geometry.type === 'Polygon') {
    return { type: 'MultiPolygon', coordinates: [geometry.coordinates] };
  } else {
    return null;
  }
}

/**
 * Makes a parent ReactMapGL component editable. This is a wrapper around the MapboxDraw control.
 * The editor supports drawing a boundary consisting of a single polygon.
 */
export default function SplitPolygonDraw({ features, setFeatures, ...otherProps }: SplitPolygonProps) {
  const [mapRef, setMapRef] = useState<MapRef>();

  // Need ts-ignore because the draw control's event types are added by the draw plugin and aren't
  // included in the type definitions for the first arguments of MapRef.on() and MapRef.off().
  const draw = useControl<MapboxDraw>(({ map }) => {
    const initialMode = 'draw_polygon';

    setMapRef(map);

    return new MapboxDraw({ defaultMode: initialMode, ...defaultProps, ...otherProps });
  });

  const removeExistingPolygon = useCallback(() => {
    // We only allow one polygon on the map; if there's an existing one, delete it.
    const allFeatures = draw.getAll().features;
    if (allFeatures.length > 1) {
      draw.delete(`${allFeatures[0].id}`);
    }
  }, [draw]);

  const switchToPolygonModeIfFeatureDeleted = useCallback(() => {
    const allFeatures = draw.getAll().features;
    if (allFeatures.length === 0) {
      draw.changeMode('draw_polygon');
    }
  }, [draw]);

  const splitOn = useCallback(
    (event: DrawCreateEvent | DrawUpdateEvent) => {
      const mp = toMultiPolygon(event.features[0].geometry);
      if (mp) {
        const intersections = features.map((f) => intersect(mp, f));
        if (!intersections.some((f) => f !== null)) {
          return;
        }
        const splitFeatures = intersections.reduce((acc, curr, index) => {
          const originalFeature = features[index];
          if (curr !== null) {
            const subtracted = difference(originalFeature, curr);
            if (subtracted !== null) {
              return [...acc, subtracted, curr];
            }
          }
          return [...acc, originalFeature];
        }, [] as GeometryFeature[]);
        draw.deleteAll();
        draw.changeMode('draw_polygon');
        setFeatures(splitFeatures);
      }
    },
    [features, draw, setFeatures]
  );

  const onCreate = useCallback((event: DrawCreateEvent) => void splitOn(event), [splitOn]);

  const onUpdate = useCallback((event: DrawUpdateEvent) => void splitOn(event), [splitOn]);

  useEffect(() => {
    mapRef?.on('draw.create', removeExistingPolygon);
    mapRef?.on('draw.create', onCreate);
    mapRef?.on('draw.delete', switchToPolygonModeIfFeatureDeleted);
    mapRef?.on('draw.update', onUpdate);

    return () => {
      mapRef?.off('draw.create', removeExistingPolygon);
      mapRef?.off('draw.create', onCreate);
      mapRef?.off('draw.delete', switchToPolygonModeIfFeatureDeleted);
      mapRef?.off('draw.update', onUpdate);
    };
  }, [mapRef, removeExistingPolygon, switchToPolygonModeIfFeatureDeleted, onCreate, onUpdate]);

  return null;
}
