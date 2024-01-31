import { Feature, FeatureCollection, Geometry, MultiPolygon } from 'geojson';
import { Theme } from '@mui/material';
import center from '@turf/center';
import difference from '@turf/difference';
import intersect from '@turf/intersect';
import union from '@turf/union';
import _ from 'lodash';
import {
  GeometryFeature,
  MapDrawingLayer,
  MapErrorLayer,
  MapSourceProperties,
  MapSourceRenderProperties,
} from 'src/types/Map';

export function toMultiPolygon(geometry: Geometry): MultiPolygon | null {
  if (geometry.type === 'MultiPolygon') {
    return geometry;
  } else if (geometry.type === 'Polygon') {
    return { type: 'MultiPolygon', coordinates: [geometry.coordinates] };
  } else {
    return null;
  }
}

export function unionMultiPolygons(featureCollection: FeatureCollection): MultiPolygon | null {
  const polyArray: MultiPolygon[] = _.cloneDeep(featureCollection)
    .features.map((feature: Feature) => toMultiPolygon(feature.geometry))
    .filter((poly: MultiPolygon | null) => poly !== null) as MultiPolygon[];

  if (!polyArray.length) {
    return null;
  }

  return polyArray.reduce((acc: MultiPolygon, curr: MultiPolygon): MultiPolygon => {
    const unionResult = union(acc, curr);
    const multiPolygon = unionResult ? toMultiPolygon(unionResult.geometry) : null;
    return multiPolygon || curr;
  });
}

export function toFeature(
  poly: Geometry,
  properties: MapSourceProperties,
  id: string | number
): Feature & { id: string | number } {
  const idToUse = id === -1 ? 0 : id;
  const geometry = toMultiPolygon(poly) || { type: 'MultiPolygon', coordinates: [] };

  return {
    type: 'Feature',
    geometry,
    properties: { ...properties, id: properties.id ?? idToUse },
    id: idToUse,
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

export const getMapErrorLayer = (theme: Theme, id: string): MapErrorLayer => ({
  errorText: {
    id: `error-text-${id}`,
    type: 'symbol',
    paint: {
      'text-color': theme.palette.TwClrTxtDanger,
    },
    layout: {
      'text-field': '{errorText}',
      'text-size': 14,
    },
  },
  errorPolygon: {
    id: `error-line-${id}`,
    type: 'line',
    filter: ['all', ['==', '$type', 'Polygon']],
    paint: {
      'line-color': theme.palette.TwClrTxtDanger,
      'line-dasharray': [3, 5],
      'line-width': 1,
    },
  },
});

export const getMapDrawingLayer = (source: MapSourceRenderProperties, sourceId: string): MapDrawingLayer => {
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
        'line-color': [
          // if feature is selected, use selectLineColor if defined
          'case',
          ['boolean', ['feature-state', 'select'], false],
          source.selectLineColor ?? source.lineColor,
          source.lineColor,
        ],
        'line-width': [
          // if feature is selected, use selectLineWidth if defined
          'case',
          ['boolean', ['feature-state', 'select'], false],
          source.selectLineWidth ?? source.lineWidth,
          source.lineWidth,
        ],
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
        const subtractedPolys = toMultiPolygon(subtracted.geometry);
        if (subtractedPolys !== null && subtractedPolys.coordinates.length) {
          // split disjoint polygons into separate features
          const subtractedFeatures = subtractedPolys.coordinates.map((coords, coordsIndex) => {
            const f = coordsIndex === 0 ? originalFeature : { ...originalFeature, properties: {}, id: undefined };
            return {
              ...f,
              geometry: { type: 'MultiPolygon', coordinates: [coords] },
            };
          }) as GeometryFeature[];
          return [...acc, ...subtractedFeatures, curr];
        }
      }
    }
    return [...acc, originalFeature];
  }, [] as GeometryFeature[]);

  return _.isEqual(splitFeatures, source) ? null : splitFeatures;
};

/**
 * Returns left most feature with it's center point.
 * @param features
 *   The features' geometries to consider.
 * @returns
 *   left most feature and it's center point if one exists
 *   otherwise, null
 */
export const leftMostFeature = (features: GeometryFeature[]): { feature: GeometryFeature; center: number[] } | null => {
  return leftOrderedFeatures(features)[0] ?? null;
};

/**
 * Returns features ordered from left/bottom and progressing up/right
 */
export const leftOrderedFeatures = (features: GeometryFeature[]): { feature: GeometryFeature; center: number[] }[] => {
  return features
    .map((feature) => ({
      feature,
      center: center(feature.geometry)?.geometry?.coordinates,
    }))
    .filter((data) => data.center)
    .sort((data1, data2) => {
      if (data1.center[0] === data2.center[0]) {
        return data1.center[1] - data2.center[1];
      } else {
        return data1.center[0] - data2.center[0];
      }
    });
};
