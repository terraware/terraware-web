import { components } from 'src/api/types/generated-schema';

// planting site, zone, subzone
export type PlantingSite = components['schemas']['PlantingSitePayload'];
export type PlantingZone = components['schemas']['PlantingZonePayload'];
export type PlantingSubzone = components['schemas']['PlantingSubzonePayload'];

// geometry and types of geometries
export type Polygon = components['schemas']['Polygon'];
export type MultiPolygon = components['schemas']['MultiPolygon'];

// Search API always returns strings
export type PlantingSiteSearchResult = {
  boundary?: MultiPolygon | Polygon;
  id: string;
  name: string;
  description?: string;
  isDraft?: boolean;
  numPlantingSubzones: string;
  'numPlantingSubzones(raw)': number;
  numPlantingZones: string;
  'numPlantingZones(raw)': number;
  project_id: number;
  project_name: string;
  timeZone?: string;
  'totalPlants(raw)': number;
};

// delivery and plantings
export type Delivery = components['schemas']['DeliveryPayload'];
export type Planting = components['schemas']['PlantingPayload'];

// reported plants
export type PlantingSiteReportedPlants = components['schemas']['PlantingSiteReportedPlantsPayload'];
export type PlantingSiteReportedZonePlants = components['schemas']['PlantingZoneReportedPlantsPayload'];
export type PlantingSiteReportedSubzonePlants = components['schemas']['PlantingSubzoneReportedPlantsPayload'];

// Planting site with select data from reports merged in
export type PlantingSiteWithReportedPlants = Omit<PlantingSite, 'plantingZones'> & {
  plantingZones: PlantingSiteZoneWithReportedPlants[];
};
export type PlantingSiteZoneWithReportedPlants = Omit<PlantingZone, 'plantingSubzones'> & {
  plantingSubzones: PlantingSiteSubzoneWithReportedPlants[];
};
export type PlantingSiteSubzoneWithReportedPlants = PlantingSubzone &
  Omit<PlantingSiteReportedSubzonePlants, 'totalPlants'> & {
    totalPlants?: number;
  };

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

export type MinimalPlantingSubzone = Omit<PlantingSubzone, 'areaHa'>;

export type MinimalPlantingZone = Omit<PlantingZone, 'areaHa' | 'plantingSubzones'> & {
  plantingSubzones: MinimalPlantingSubzone[];
};

/**
 * A minimal planting site representing basic details for view/edit purposes.
 */
export type MinimalPlantingSite = Location & {
  boundary?: MultiPolygon;
  description?: string;
  id: number;
  name: string;
  organizationId: number;
  plantingSeasons: PlantingSeason[];
  plantingZones?: MinimalPlantingZone[];
  projectId?: number;
};
