import { components } from 'src/api/types/generated-schema';

// planting site, stratum, substratum
export type PlantingSite = components['schemas']['PlantingSitePayload'];
export type Stratum = components['schemas']['StratumResponsePayload'];
export type Substratum = components['schemas']['SubstratumResponsePayload'];

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

export type MinimalSubstratum = Omit<Substratum, 'areaHa' | 'monitoringPlots'>;

export type MinimalStratum = Omit<
  Stratum,
  'areaHa' | 'substrata' | 'boundaryModifiedTime' | 'numPermanentPlots' | 'numTemporaryPlots'
> & {
  substrata: MinimalSubstratum[];
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
  strata?: MinimalStratum[];
  projectId?: number;
};

export type PlantingSiteHistory = components['schemas']['PlantingSiteHistoryPayload'];

export type PlotT0Data = components['schemas']['PlotT0DataPayload'];
export type SiteT0Data = components['schemas']['SiteT0DataResponsePayload'];
export type AssignSiteT0Data = components['schemas']['AssignSiteT0DataRequestPayload'];
export type AssignSiteT0TempData = components['schemas']['AssignSiteT0TempDataRequestPayload'];
export type ZoneT0Data = components['schemas']['ZoneT0DataPayload'];
export type SpeciesPlot = components['schemas']['PlotSpeciesDensitiesPayload'];
