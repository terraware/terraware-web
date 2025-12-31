import React from 'react';
import { Layer, LngLatBoundsLike, Source } from 'react-map-gl/mapbox';

import { Theme } from '@mui/material';
import bbox from '@turf/bbox';
import center from '@turf/center';
import difference from '@turf/difference';
import intersect from '@turf/intersect';
import union from '@turf/union';
import { Feature, FeatureCollection, Geometry, MultiPolygon } from 'geojson';
import _ from 'lodash';

import {
  GeometryFeature,
  MapDrawingLayer,
  MapErrorLayer,
  MapSourceProperties,
  MapSourceRenderProperties,
  ReadOnlyBoundary,
  RenderableReadOnlyBoundary,
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
      'text-color': theme.palette.TwClrTxtInverse,
      'text-halo-color': theme.palette.TwClrBaseBlack,
      'text-halo-blur': 2,
      'text-halo-width': 2,
    },
    layout: {
      'text-field': '{errorText}',
      'text-size': 14,
    },
  },
  errorLine: {
    id: `error-line-${id}`,
    type: 'line',
    filter: ['all', ['==', '$type', 'Polygon']],
    paint: {
      'line-color': theme.palette.TwClrTxtDanger,
      'line-dasharray': [3, 5],
      'line-width': 1,
    },
  },
  errorFill: {
    id: `error-fill-${id}`,
    type: 'fill',
    filter: ['all', ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': ['case', ['==', ['get', 'fill'], true], theme.palette.TwClrTxtDanger, 'transparent'],
      'fill-opacity': ['case', ['==', ['get', 'fill'], true], 0.15, 0],
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
            'fill-pattern': source.patternFill,
            'fill-opacity': source.opacity ?? 1.0,
          },
        }
      : null,
  };
};

/**
 * Overlay a new polygon onto the exisitng features, and subtracting the intersection from existing features
 * to preserve the disjoint set property. The result is expected to be a disjoint set of polygons spanning the entire
 * boundary. Empty polygons are removed as well.
 *
 * @param source
 *  The source polygons, that should span the boundary.
 * @param newPolygon
 *  The polygon to be overlayed onto the polygon. Areas outside the boundary will be trimmed and removed.
 * @returns
 *  The resulting list of polygons.
 *  Null if there was no overlap. Which means the new polygon is outside the boundary
 */
export const overlayAndSubtract = (source: GeometryFeature[], newPolygon: Geometry): GeometryFeature[] | null => {
  if (newPolygon.type !== 'Polygon' && newPolygon.type !== 'MultiPolygon') {
    return null;
  }

  const intersections = source.map((poly) => intersect(newPolygon, poly));

  if (!intersections.some((f) => f !== null)) {
    return null;
  }

  const newFeature = intersections.reduce((acc, curr) => {
    // If it has intersection
    if (curr !== null) {
      // If there is not previous intersection
      if (acc === null) {
        return curr;
      } else {
        return union(acc, curr);
      }
    }
    return acc;
  });

  // Subtract intersection from each of the existing stratum
  const newFeatures = intersections.reduce((acc, curr, index) => {
    const originalFeature = source[index];

    // If there is an overlap and existing feautre can be cut
    if (curr !== null && !originalFeature.properties?.isFixed) {
      const subtracted = difference(originalFeature, curr);
      if (subtracted !== null) {
        const subtractedPolys = toMultiPolygon(subtracted.geometry);
        if (subtractedPolys !== null) {
          const subtractedFeature = {
            ...originalFeature,
            geometry: { type: 'MultiPolygon', coordinates: subtractedPolys?.coordinates },
          } as GeometryFeature;
          return [...acc, subtractedFeature];
        }
      } else {
        // The original polygon is completely covered by the new polygon. Remove it.
        return acc;
      }
    }
    return [...acc, originalFeature];
  }, [] as GeometryFeature[]);

  const newCoords = newFeature ? toMultiPolygon(newFeature.geometry) : null;
  if (newCoords !== null) {
    newFeatures.push({
      ...newFeature,
      geometry: { type: 'MultiPolygon', coordinates: newCoords.coordinates },
    } as GeometryFeature);
  }

  return _.isEqual(newFeatures, source) ? null : newFeatures;
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

export const boundariesToViewState = (boundaries: ReadOnlyBoundary[]) => {
  const coordinates = boundaries
    .flatMap((b) => b.data.features)
    .flatMap((feature) => toMultiPolygon(feature.geometry))
    .filter((poly: MultiPolygon | null): poly is MultiPolygon => poly !== null)
    .flatMap((poly: MultiPolygon) => poly.coordinates);

  return {
    bounds: bbox({
      type: 'MultiPolygon',
      coordinates,
    }) as LngLatBoundsLike,
    fitBoundsOptions: {
      animate: false,
      padding: 25,
    },
  };
};

export const readOnlyBoundariesToMapLayers = (boundaries?: RenderableReadOnlyBoundary[]) => {
  if (!boundaries?.length) {
    return null;
  }

  return boundaries.map((boundaryData: RenderableReadOnlyBoundary) => {
    const drawingLayer: MapDrawingLayer = getMapDrawingLayer(boundaryData.renderProperties, boundaryData.id);
    return (
      <Source type='geojson' key={boundaryData.id} data={boundaryData.data} id={boundaryData.id}>
        {drawingLayer.patternFill && <Layer {...drawingLayer.patternFill} />}
        {drawingLayer.textAnnotation && <Layer {...drawingLayer.textAnnotation} />}
        {drawingLayer.layerOutline && <Layer {...drawingLayer.layerOutline} />}
        {drawingLayer.layer && <Layer {...drawingLayer.layer} />}
      </Source>
    );
  });
};
