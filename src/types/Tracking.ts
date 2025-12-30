import { components } from 'src/api/types/generated-schema';

// planting site, zone, subzone
export type PlantingSite = components['schemas']['PlantingSitePayload'];
export type PlantingZone = components['schemas']['PlantingZonePayload'];
export type PlantingSubzone = components['schemas']['PlantingSubzonePayload'];
export type PlantingZoneWithSubzonesWithLastObservationDate = Omit<PlantingZone, 'plantingSubzones'> & {
  plantingSubzones: PlantingSubzoneWithLastObservationDate[];
};
export type PlantingSubzoneWithLastObservationDate = PlantingSubzone & { lastObservationDate?: Date };
export type PlantingSiteWithSubzonesWithLastObservationDate = Omit<PlantingSite, 'plantingZones'> & {
  plantingZones?: PlantingZoneWithSubzonesWithLastObservationDate[];
};

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
  numStrata: string;
  'numStrata(raw)': number;
  numSubstrata: string;
  'numSubstrata(raw)': number;
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
  plotNumber: number;
};

// planting seasons
export type PlantingSeason = components['schemas']['PlantingSeasonPayload'];
export type UpdatedPlantingSeason = components['schemas']['UpdatedPlantingSeasonPayload'];

export type Location = {
  timeZone?: string;
};

export type MinimalPlantingSubzone = Omit<PlantingSubzone, 'areaHa' | 'monitoringPlots'>;

export type MinimalPlantingZone = Omit<
  PlantingZone,
  'areaHa' | 'plantingSubzones' | 'boundaryModifiedTime' | 'numPermanentPlots' | 'numTemporaryPlots'
> & {
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

export type PlantingSiteHistory = components['schemas']['PlantingSiteHistoryPayload'];
export type PlantingZoneHistory = components['schemas']['PlantingZoneHistoryPayload'];

export type PlotT0Data = components['schemas']['PlotT0DataPayload'];
export type SiteT0Data = components['schemas']['SiteT0DataResponsePayload'];
export type AssignSiteT0Data = components['schemas']['AssignSiteT0DataRequestPayload'];
export type AssignSiteT0TempData = components['schemas']['AssignSiteT0TempDataRequestPayload'];
export type StratumT0Data = components['schemas']['StratumT0DataPayload'];
export type SpeciesPlot = components['schemas']['PlotSpeciesDensitiesPayload'];
