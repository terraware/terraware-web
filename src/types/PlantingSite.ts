import {
  CreateDraftPlantingSiteRequestPayload as CreateDraftPlantingSiteRequestPayloadRaw,
  DraftPlantingSitePayload as DraftPlantingSitePayloadRaw,
} from 'src/queries/generated/draftPlantingSites';
import {
  CreatePlantingSiteRequestPayload as CreatePlantingSiteRequestPayloadRaw,
  PlantingSiteValidationProblemPayload,
} from 'src/queries/generated/plantingSites';

import { MinimalPlantingSite, MultiPolygon } from './Tracking';

export type SiteType = DraftPlantingSitePayloadRaw['siteType'];
export type SiteEditStep = 'site_boundary' | 'exclusion_areas' | 'stratum_boundaries' | 'substratum_boundaries';
export type OptionalSiteEditStep = Exclude<SiteEditStep, 'site_boundary'>;

export type PlantingSitesFilters = {
  projectIds?: number[];
};

export type DraftPlantingSitePayload = Omit<DraftPlantingSitePayloadRaw, 'createdTime' | 'data' | 'modifiedTime'>;

export type CreateDraftPlantingSiteRequestPayload = Omit<CreateDraftPlantingSiteRequestPayloadRaw, 'data'>;

/**
 * Planting Sites Payloads
 */
export type CreatePlantingSiteRequestPayload = CreatePlantingSiteRequestPayloadRaw;

export type PlantingSiteProblem = PlantingSiteValidationProblemPayload;

/** How the site boundary was produced; only used for analytics. */
export type BoundarySource = 'drawn' | 'uploaded' | 'uploaded_edited';

/**
 * Client side draft planting site with first class properties.
 */
export type DraftPlantingSite = MinimalPlantingSite & {
  boundarySource?: BoundarySource;
  createdBy: number; // user that created this draft
  exclusion?: MultiPolygon;
  siteEditStep: SiteEditStep;
  siteType: SiteType;
};

export type PlantingProgressType = {
  initialPlantingDensity: number;
  plantingCompleted: boolean;
  projectName: string;
  siteId: number;
  siteName: string;
  stratumId: number;
  stratumName: string;
  substratumId: number;
  substratumName: string;
  totalPlants: number;
  totalSeedlingsSent: number;
};
