import { components } from './generated-schema';

export const schemas = 'schemas';

// planting site, zone, plot
export type PlantingSite = components[typeof schemas]['PlantingSitePayload'];
export type PlantingZone = components[typeof schemas]['PlantingZonePayload'];
export type Plot = components[typeof schemas]['PlotPayload'];

// geometry and types of geometries
export type Geometry = components[typeof schemas]['Geometry'];
export type Point = components[typeof schemas]['Point'];
export type LineString = components[typeof schemas]['LineString'];
export type Polygon = components[typeof schemas]['Polygon'];
export type MultiPoint = components[typeof schemas]['MultiPoint'];
export type MultiLineString = components[typeof schemas]['MultiLineString'];
export type MultiPolygon = components[typeof schemas]['MultiPolygon'];
export type GeometryCollection = components[typeof schemas]['GeometryCollection'];
