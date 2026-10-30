import {
  MultiPolygon,
  PlantingSitePayload,
  Polygon,
  StratumResponsePayload,
  SubstratumResponsePayload,
} from 'src/queries/generated/plantingSites';
import {
  AssignSiteT0DataRequestPayload,
  AssignSiteT0TempDataRequestPayload,
  PlotSpeciesDensitiesPayload,
  PlotT0DataPayload,
  SiteT0DataResponsePayload,
  StratumT0DataPayload,
} from 'src/queries/generated/t0';

// planting site, stratum, substratum
export type PlantingSite = PlantingSitePayload;
export type Stratum = StratumResponsePayload;
type Substratum = SubstratumResponsePayload;

// geometry and types of geometries
export type { MultiPolygon };

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
  strata?: MinimalStratum[];
  projectId?: number;
};

export type PlotT0Data = PlotT0DataPayload;
export type SiteT0Data = SiteT0DataResponsePayload;
export type AssignSiteT0Data = AssignSiteT0DataRequestPayload;
export type AssignSiteT0TempData = AssignSiteT0TempDataRequestPayload;
export type StratumT0Data = StratumT0DataPayload;
export type SpeciesPlot = PlotSpeciesDensitiesPayload;
