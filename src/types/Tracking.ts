import { components } from 'src/api/types/generated-schema';

// planting site, zone, subzone
export type PlantingSite = components['schemas']['PlantingSitePayload'];
export type PlantingZone = components['schemas']['PlantingZonePayload'];
export type PlantingSubzone = components['schemas']['PlantingSubzonePayload'];

// Search API always returns strings
export type PlantingSiteSearchResult = {
  boundary?: components['schemas']['MultiPolygon'];
  id: string;
  name: string;
  numPlantingZones: string;
  numPlantingSubzones: string;
  'totalPlants(raw)': string;
  project_name: string;
};

// geometry and types of geometries
export type MultiPolygon = components['schemas']['MultiPolygon'];

// delivery and plantings
export type Delivery = components['schemas']['DeliveryPayload'];
export type Planting = components['schemas']['PlantingPayload'];

// reported plants
export type PlantingSiteReportedPlants = components['schemas']['PlantingSiteReportedPlantsPayload'];

// monitoring plots
export type MonitoringPlotSearchResult = {
  id: number;
  fullName: string;
};
