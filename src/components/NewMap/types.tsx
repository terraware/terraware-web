import { IconName } from '@terraware/web-components';
import { MultiPolygon } from 'geojson';

export type MapBounds = { minLat: number; minLng: number; maxLat: number; maxLng: number };

/**
 * Properties class for GeoJson, with a few reserved object defined.
 */
export type MapProperties = {
  id: string;
  clickable: boolean;
  layerFeatureId: string; // combining layer + feautre ID
  layerId: string; // determines which style to apply
  priority: number;
  [name: string]: any;
};

export type MapLayerFeatureId = {
  layerId: string;
  featureId: string;
};

export type MapCursor = 'auto' | 'crosshair' | 'default' | 'pointer' | 'grab';

export type MapIconComponentStyle = {
  iconColor: string;
  iconName: IconName;
  type: 'icon';
};

export type MapFillComponentStyle = {
  borderColor?: string;
  fillColor?: string;
  fillPatternUrl?: string;
  opacity?: number;
  type: 'fill';
};

// Each layer item will become a feature, with a property of id.
export type MapLayerFeature = {
  featureId: string;
  geometry: MultiPolygon;
  label?: string;
  onClick?: () => void;
  priority?: number; // Items with higher priority will be clicked first
  selected?: boolean;
};

// Each layer will become a set of features that have the same type.
export type MapLayer = {
  disabled?: boolean;
  features: MapLayerFeature[];
  label: string;
  layerId: string;
  style: MapFillComponentStyle;
};

export type MapHighlight = {
  featureIds: MapLayerFeatureId[];
  style: MapFillComponentStyle;
};

// Additional shading/annotations for map entities
export type MapHighlightGroup = {
  highlightId: string;
  highlights: MapHighlight[];
  visible: boolean;
};

export type MapMarker = {
  id: string; // Must be unique
  longitude: number;
  latitude: number;
  onClick?: () => void;
  selected?: boolean;
};

export type MapMarkerGroup = {
  disabled?: boolean;
  label: string;
  markers: MapMarker[];
  markerGroupId: string;
  style: MapIconComponentStyle;
  visible: boolean;
};

export type MapViewStyle = 'Outdoors' | 'Satellite' | 'Light' | 'Dark' | 'Streets';
export const MapViewStyles: MapViewStyle[] = ['Outdoors', 'Satellite', 'Light', 'Dark', 'Streets'];

export const stylesUrl: Record<MapViewStyle, string> = {
  Outdoors: 'mapbox://styles/mapbox/outdoors-v12?optimize=true',
  Satellite: 'mapbox://styles/mapbox/satellite-streets-v12?optimize=true',
  Streets: 'mapbox://styles/mapbox/streets-v12?optimize=true',
  Light: 'mapbox://styles/mapbox/light-v11?optimize=true',
  Dark: 'mapbox://styles/mapbox/dark-v11?optimize=true',
};
