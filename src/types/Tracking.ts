import { components } from 'src/api/types/generated-schema';

const schemas = 'schemas';

// planting site, zone, plot
export type PlantingSite = components[typeof schemas]['PlantingSitePayload'];
export type PlantingZone = components[typeof schemas]['PlantingZonePayload'];
export type Plot = components[typeof schemas]['PlotPayload'];

// geometry and types of geometries
export type MultiPolygon = components[typeof schemas]['MultiPolygon'];

// delivery and plantings
export type Delivery = components[typeof schemas]['DeliveryPayload'];
export type Planting = components[typeof schemas]['PlantingPayload'];
