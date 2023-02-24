import { components } from 'src/api/types/generated-schema';

// planting site, zone, plot
export type PlantingSite = components['schemas']['PlantingSitePayload'];
export type PlantingZone = components['schemas']['PlantingZonePayload'];
export type Plot = components['schemas']['PlotPayload'];

// geometry and types of geometries
export type MultiPolygon = components['schemas']['MultiPolygon'];

// delivery and plantings
export type Delivery = components['schemas']['DeliveryPayload'];
export type Planting = components['schemas']['PlantingPayload'];
