import { Feature, FeatureCollection, Geometry, MultiPolygon } from 'geojson';
import intersect from '@turf/intersect';
import difference from '@turf/difference';
import _ from 'lodash';
import { MapSourceProperties, MapSourceRenderProperties } from 'src/types/Map';
import { GeometryFeature } from './types';

export function toMultiPolygon(geometry: Geometry): MultiPolygon | null {
  if (geometry.type === 'MultiPolygon') {
    return geometry;
  } else if (geometry.type === 'Polygon') {
    return { type: 'MultiPolygon', coordinates: [geometry.coordinates] };
  } else {
    return null;
  }
}

export function toMultiPolygonArray(featureCollection: FeatureCollection): MultiPolygon[] | undefined {
  const polyArray = featureCollection.features
    .map((feature: Feature) => toMultiPolygon(feature.geometry))
    .filter((poly: MultiPolygon | null) => poly !== null) as MultiPolygon[];

  return polyArray.length ? polyArray : undefined;
}

export function toFeature(
  multiPolygon: MultiPolygon,
  properties: MapSourceProperties,
  id: number
): Feature & { id: number } {
  return {
    type: 'Feature',
    geometry: {
      type: 'MultiPolygon',
      coordinates: multiPolygon.coordinates,
    },
    properties,
    id,
  };
}

export const getFillColor = (source: MapSourceRenderProperties, type: 'highlight' | 'select' | 'hover' | 'default') => {
  switch (type) {
    case 'highlight':
      return source.highlightFillColor || source.fillColor;
    case 'select':
      return source.selectFillColor || source.fillColor;
    case 'hover':
      return source.hoverFillColor || source.fillColor;
    default:
      return source.fillColor;
  }
};

export const getMapDrawingLayer = (source: MapSourceRenderProperties, sourceId: string) => {
  return {
    id: sourceId,
    isInteractive: source.isInteractive,
    layer: {
      id: `${sourceId}-fill`,
      type: 'fill',
      paint: {
        'fill-color': [
          // Use a case-expression to decide which color to use for fill
          // see https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#case
          // and, https://docs.mapbox.com/mapbox-gl-js/api/map/#map#setfeaturestate
          // if highlight, use highlight color
          // else if selected, use select color
          // else if hover, user hover color
          // else use default fill color
          'case',
          ['boolean', ['feature-state', 'highlight'], false],
          getFillColor(source, 'highlight'),
          ['boolean', ['feature-state', 'select'], false],
          getFillColor(source, 'select'),
          ['boolean', ['feature-state', 'hover'], false],
          getFillColor(source, 'hover'),
          getFillColor(source, 'default'),
        ],
      },
    },
    layerOutline: {
      id: `${sourceId}-outline`,
      type: 'line',
      paint: {
        'line-color': source.lineColor,
        'line-width': source.lineWidth,
      },
    },
    textAnnotation: source.annotation
      ? {
          id: `${sourceId}-annotation`,
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
    patternFill: source.patternFill
      ? {
          id: `${sourceId}-pattern`,
          type: 'fill',
          paint: {
            'fill-pattern': source.patternFill.imageName,
            'fill-opacity': source.patternFill.opacityExpression ?? 1.0,
          },
        }
      : null,
  };
};

/**
 * Cut source polygons into smaller polygons
 * @param source
 *  The source polygons that need to be split into smaller polygons
 * @param cutWith
 *  The polygon to use as the overlap check in order to cut polygons
 * @returns
 *  List of polygons that were cut as a result of overlaps with cutWith
 *  Null if there was no overlap
 */
export const cutPolygons = (source: GeometryFeature[], cutWith: Geometry): GeometryFeature[] | null => {
  if (cutWith.type !== 'Polygon' && cutWith.type !== 'MultiPolygon') {
    return null;
  }

  const intersections = source.map((poly) => intersect(cutWith, poly));
  if (!intersections.some((f) => f !== null)) {
    return null;
  }

  const splitFeatures = intersections.reduce((acc, curr, index) => {
    const originalFeature = source[index];
    if (curr !== null) {
      const subtracted = originalFeature.properties?.isFixed ? null : difference(originalFeature, curr);
      if (subtracted !== null) {
        return [...acc, subtracted, curr];
      }
    }
    return [...acc, originalFeature];
  }, [] as GeometryFeature[]);

  return _.isEqual(splitFeatures, source) ? null : splitFeatures;
};
