// flattened info for shapes relating to planting site data
import React from 'react';
import { LayerProps } from 'react-map-gl/mapbox';

import { SxProps } from '@mui/material';
import { Feature, FeatureCollection, GeoJsonProperties, MultiPolygon, Polygon } from 'geojson';
import mapboxgl, { Expression } from 'mapbox-gl';

export type GeometryFeature = Feature<Polygon | MultiPolygon, GeoJsonProperties>;

export type PopupInfo = {
  id?: string | number;
  lng: number;
  lat: number;
  properties: any;
  sourceId: string;
};

export type MapGeometry = number[][][][];

/**
 * Example of a boundary:
 * ```json
 * [
 *   [
 *     [
 *       [-67.13734, 45.13745],
 *       [-66.96466, 44.8097],
 *       [-68.03252, 44.3252],
 *       [-69.06, 43.98],
 *       [-70.11617, 43.68405],
 *       [-70.64573, 43.09008],
 *       [-70.75102, 43.08003],
 *       [-70.79761, 43.21973],
 *     ]
 *   ],
 *   [
 *     [
 *       [-70.98176, 43.36789],
 *       [-70.94416, 43.46633],
 *       [-71.08482, 45.30524],
 *       [-70.66002, 45.46022],
 *       [-70.30495, 45.91479],
 *       [-70.00014, 46.69317],
 *       [-69.23708, 47.44777],
 *       [-68.90478, 47.18479],
 *       [-68.2343, 47.35462],
 *       [-67.79035, 47.06624],
 *       [-67.79141, 45.70258],
 *       [-67.13734, 45.13745]
 *     ]
 *   ]
 * ]
 * ```
 */

export type MapSourceProperties = { [key: string]: any };

export type MapAnnotation = {
  textField: string; // property field whose value to render as annotation
  textSize: number;
  textColor: string;
};

export type MapPatternFill = Expression | string;

/**
 * A renderable map entity
 * eg. site, stratum, substratum
 */
export type MapEntity = {
  properties: MapSourceProperties;
  boundary: MapGeometry;
  id: number;
  totalArea?: number;
};

export type MapSourceBaseData = {
  id: string;
  entities: MapEntity[];
};

export type MapSourceRenderProperties = {
  annotation?: MapAnnotation;
  fillColor: string | Expression;
  highlightFillColor?: string;
  hoverFillColor?: string;
  isInteractive?: boolean;
  lineColor: string;
  lineWidth: number;
  patternFill?: MapPatternFill;
  opacity?: number | Expression;
  selectFillColor?: string;
  selectLineColor?: string;
  selectLineWidth?: number;
};

export type MapSource = MapSourceBaseData & MapSourceRenderProperties;

export type MapBoundingBox = {
  lowerLeft: [number, number];
  upperRight: [number, number];
};

export type MapOptions = {
  bbox: MapBoundingBox;
  sources: MapSource[];
};

/**
 * Render a popup based on properties
 */
export type MapPopupRenderer = {
  anchor?: mapboxgl.Anchor;
  className?: string;
  render: (properties: MapSourceProperties, onClose?: () => void) => JSX.Element | null;
  style?: object;
  sx?: SxProps;
};

/**
 * Model an identifiable entity
 */
export type MapEntityId = {
  id?: number; // id of entity, undefined for unknown
  sourceId: string; // source type of entity 'substratum', 'stratum', 'site', etc.
};

/**
 * map entity options
 */
export type MapEntityOptions = {
  focus?: MapEntityId[];
  highlight?: MapEntityId[];
  select?: MapEntityId[];
};

/**
 * Types of objects that can be added to MapData
 */
export type MapObject = 'site' | 'stratum' | 'substratum' | 'permanentPlot' | 'temporaryPlot' | 'adHocPlot';

/**
 * Sources for a map
 */
export type MapData = Record<MapObject, MapSourceBaseData | undefined>;

/**
 * Map control props
 */
export type MapControl = {
  // hide the full screen control
  hideFullScreen?: boolean;

  // custom map controls
  topRightMapControl?: React.ReactNode;
  bottomLeftMapControl?: React.ReactNode;
  hideAllControls?: boolean;
  disableZoom?: boolean;
};

/**
 * Map view style
 */
export type MapViewStyle = 'Outdoors' | 'Satellite' | 'Light' | 'Dark' | 'Streets';
export const MapViewStyles: Record<MapViewStyle, string> = {
  Outdoors: 'mapbox://styles/mapbox/outdoors-v12?optimize=true',
  Satellite: 'mapbox://styles/mapbox/satellite-streets-v12?optimize=true',
  Streets: 'mapbox://styles/mapbox/streets-v12?optimize=true',
  Light: 'mapbox://styles/mapbox/light-v11?optimize=true',
  Dark: 'mapbox://styles/mapbox/dark-v11?optimize=true',
};

export type ReadOnlyBoundary = {
  data: FeatureCollection;
  selectedId?: number;
  id: string;
  isInteractive?: boolean;
};

export type RenderableReadOnlyBoundary = ReadOnlyBoundary & {
  renderProperties: MapSourceRenderProperties;
};

// TODO: integrate exclusions as a first class MapObject (not there yet)
export type RenderableObject =
  | MapObject
  | 'exclusions'
  | 'draft-stratum'
  | 'draft-substratum'
  | 'boundary'
  | 'countryBoundary'
  | 'strataBoundary';

export type MapDrawingLayer = {
  id: string;
  isInteractive?: boolean;
  layer: LayerProps;
  layerOutline: LayerProps;
  patternFill: LayerProps | null;
  textAnnotation: LayerProps | null;
};

export type MapErrorLayer = {
  errorFill: LayerProps;
  errorLine: LayerProps;
  errorText: LayerProps;
};
