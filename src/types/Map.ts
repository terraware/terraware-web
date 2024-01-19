// flattened info for shapes relating to planting site data
import React from 'react';
import mapboxgl from 'mapbox-gl';
import { Feature, FeatureCollection, GeoJsonProperties, MultiPolygon, Polygon } from 'geojson';

export type ReadOnlyBoundary = {
  featureCollection: FeatureCollection;
  id: string;
  isInteractive?: boolean;
};

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
 */

export type MapSourceProperties = { [key: string]: any };

export type MapAnnotation = {
  textField: string; // property field whose value to render as annotation
  textSize: number;
  textColor: string;
};

export type MapPatternFill = {
  imageName: string;
  opacityExpression?: any[];
};

/**
 * A renderable map entity
 * eg. site, zone, subzone
 */
export type MapEntity = {
  properties: MapSourceProperties;
  boundary: MapGeometry;
  id: number;
};

export type MapSourceBaseData = {
  id: string;
  entities: MapEntity[];
};

export type MapSourceRenderProperties = {
  fillColor: string;
  lineColor: string;
  lineWidth: number;
  isInteractive?: boolean;
  // property name to render as a polygon annotation
  annotation?: MapAnnotation;
  highlightFillColor?: string;
  hoverFillColor?: string;
  selectFillColor?: string;
  patternFill?: MapPatternFill;
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
};

/**
 * Model an identifiable entity
 */
export type MapEntityId = {
  id?: number; // id of entity, undefined for unknown
  sourceId: string; // source type of entity 'subzone', 'zone', 'site', etc.
};

/**
 * map entity options
 */
export type MapEntityOptions = {
  highlight?: MapEntityId[];
  focus?: MapEntityId[];
};

/**
 * Types of objects that can be added to MapData
 */
export type MapObject = 'site' | 'zone' | 'subzone' | 'permanentPlot' | 'temporaryPlot';

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
};

/**
 * Map view style
 */
export type MapViewStyle = 'Outdoors' | 'Satellite';
export const MapViewStyles: Record<MapViewStyle, string> = {
  Outdoors: 'mapbox://styles/mapbox/outdoors-v12?optimize=true',
  Satellite: 'mapbox://styles/mapbox/satellite-v9?optimize=true',
};
