import { components } from 'src/api/types/generated-schema';

// planting site, zone, subzone
export type PlantingSite = components['schemas']['PlantingSitePayload'];
export type PlantingZone = components['schemas']['PlantingZonePayload'];
export type PlantingSubzone = components['schemas']['PlantingSubzonePayload'];

// geometry and types of geometries
export type MultiPolygon = components['schemas']['MultiPolygon'];

// Search API always returns strings
export type PlantingSiteSearchResult = {
  boundary?: MultiPolygon;
  id: string;
  name: string;
  numPlantingSubzones: string;
  numPlantingZones: string;
  project_id: number;
  project_name: string;
  'totalPlants(raw)': string;
};

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

// planting seasons
export type PlantingSeason = components['schemas']['PlantingSeasonPayload'];
export type UpdatedPlantingSeason = components['schemas']['UpdatedPlantingSeasonPayload'];

export type Location = {
  timeZone?: string;
};

export type SitePlantingZone = Omit<PlantingZone, 'areaHa' | 'plantingSubzones'> & {
  plantingSubzones: Omit<PlantingSubzone, 'areaHa'>[];
};

/**
 * A minium planting site representation for basic details view/edit purposes.
 */
export type SiteDetails = Location & {
  boundary?: MultiPolygon;
  description?: string;
  id: number;
  name: string;
  organizationId: number;
  plantingSeasons: PlantingSeason[];
  plantingZones?: SitePlantingZone[];
  projectId?: number;
};
