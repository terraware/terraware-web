import { components } from 'src/api/types/generated-schema';
import { MultiPolygon, PlantingSite, SiteDetails } from './Tracking';

export type Population = {
  species_scientificName: string;
  totalPlants: number;
  'totalPlants(raw)': number;
};

export type PlantingSiteSubzone = {
  id: string;
  fullName: string;
  populations: Population[];
};

export type PlantingSiteZone = {
  id: string;
  name: string;
  plantingSubzones: PlantingSiteSubzone[];
};

export type PlantingSiteReportedPlants = components['schemas']['PlantingSiteReportedPlantsPayload'];

export type PlantingProgressSubzone = {
  subzoneName: string;
  plantingCompleted: boolean;
  plantingSite: string;
  zoneName: string;
  targetPlantingDensity: number;
  totalSeedlingsSent?: number;
};

export type UpdatePlantingSubzonePayload = components['schemas']['UpdatePlantingSubzoneRequestPayload'];

export type SiteType = 'simple' | 'detailed';
export type SiteEditStep = 'details' | 'site_boundary' | 'exclusion_areas' | 'zone_boundaries' | 'subzone_boundaries';

export type PlantingSitesFilters = {
  projectIds?: number[];
};

/**
 * Draft planting sites hold basic planting site information with most of the
 * client side details under a `data` JSON payload.
 * This allows the client to store boundaries and various other client flow
 * properties such as last visited workflow step, etc.
 * Expectation is for the client to parse the `data` JSON into first class properties on read,
 * and put them back into `data` as JSON upon write/update.
 */
export type DraftPlantingSitePayloadRaw = components['schemas']['DraftPlantingSitePayload'];
export type DraftPlantingSitePayload = Omit<DraftPlantingSitePayloadRaw, 'createdTime' | 'modifiedTime'>;
export type CreateDraftPlantingSiteRequestPayload = components['schemas']['CreateDraftPlantingSiteRequestPayload'];
export type CreateDraftPlantingSiteResponsePayload = components['schemas']['CreateDraftPlantingSiteResponsePayload'];
export type UpdateDraftPlantingSiteRequestPayload = components['schemas']['UpdateDraftPlantingSiteRequestPayload'];
export type GetDraftPlantingSiteResponsePayload = components['schemas']['GetDraftPlantingSiteResponsePayload'];

/**
 * Client side draft planting site with first class properties.
 */
export type DraftPlantingSite = SiteDetails & {
  createdBy: number; // user that created this draft
  exclusion?: MultiPolygon;
  siteEditStep: SiteEditStep;
  siteType: SiteType;
};
