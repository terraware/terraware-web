import {
  CreatePlantingSiteRequestPayload,
  DraftPlantingSite,
  DraftPlantingSitePayload,
  SiteEditStep,
  SiteType,
} from 'src/types/PlantingSite';
import { MinimalStratum, MinimalSubstratum, MultiPolygon } from 'src/types/Tracking';

/**
 * Utils to convert from DraftPlantingSitePayload `data` JSON
 * to `DraftPlantingSite` properties and vice-versa.
 */

// convert from client representation to BE representation
export const fromDraft = (site: DraftPlantingSite): DraftPlantingSitePayload => {
  const {
    boundary,
    createdBy,
    description,
    exclusion,
    id,
    name,
    organizationId,
    strata,
    projectId,
    siteEditStep,
    siteType,
    timeZone,
  } = site;

  // as typed in BE, to support any types of data the client wants to persist
  const data: Record<string, any> = {
    boundary,
    exclusion,
    strata,
    siteEditStep,
    siteType,
  };

  const numStrata = strata?.length;
  const numSubstrata = strata?.flatMap((stratum) => stratum.substrata)?.length;

  return {
    createdBy,
    data,
    description,
    id,
    name,
    numStrata,
    numSubstrata,
    organizationId,
    projectId,
    timeZone,
  };
};

/**
 * The BE stores `data` as an opaque client-owned blob, so the zone -> stratum and
 * target -> initial planting density renames never migrated the drafts already saved under
 * the old key names. Read every generation below and let `fromDraft` upgrade the blob in
 * place on the next save.
 */
type PersistedStratum = Omit<MinimalStratum, 'initialPlantingDensity' | 'substrata'> & {
  initialPlantingDensity?: number;
  plantingSubzones?: MinimalSubstratum[];
  substrata?: MinimalSubstratum[];
  targetPlantingDensity?: number;
};

// matches the fallback the site boundary editor uses when a stratum has no density yet
const DEFAULT_INITIAL_PLANTING_DENSITY = 1500;

const LEGACY_SITE_EDIT_STEPS: Record<string, SiteEditStep> = {
  subzone_boundaries: 'substratum_boundaries',
  zone_boundaries: 'stratum_boundaries',
};

const toStratum = (stratum: PersistedStratum): MinimalStratum => {
  const { initialPlantingDensity, plantingSubzones, substrata, targetPlantingDensity, ...rest } = stratum;

  return {
    ...rest,
    initialPlantingDensity: initialPlantingDensity ?? targetPlantingDensity ?? DEFAULT_INITIAL_PLANTING_DENSITY,
    substrata: substrata ?? plantingSubzones ?? [],
  };
};

// convert from BE representation to client representation
export const toDraft = (payload: DraftPlantingSitePayload): DraftPlantingSite => {
  const { createdBy, data, description, id, name, organizationId, projectId, timeZone } = payload;

  const boundary: MultiPolygon | undefined = data.boundary as MultiPolygon | undefined;
  const exclusion: MultiPolygon | undefined = data.exclusion as MultiPolygon | undefined;
  const persistedStrata = (data.strata ?? data.plantingZones) as PersistedStratum[] | undefined;
  const strata: MinimalStratum[] | undefined = persistedStrata?.map(toStratum);
  const persistedSiteEditStep = data.siteEditStep as SiteEditStep;
  const siteEditStep: SiteEditStep = LEGACY_SITE_EDIT_STEPS[persistedSiteEditStep] ?? persistedSiteEditStep;
  const siteType: SiteType = data.siteType as SiteType;

  return {
    boundary,
    createdBy,
    description,
    exclusion,
    id,
    name,
    organizationId,
    strata,
    projectId,
    siteEditStep,
    siteType,
    timeZone,
  };
};

export const fromDraftToCreate = (site: DraftPlantingSite): CreatePlantingSiteRequestPayload => {
  const { boundary, description, exclusion, name, organizationId, strata, projectId, timeZone } = site;

  return {
    boundary,
    description,
    exclusion,
    name,
    organizationId,
    strata,
    projectId,
    timeZone,
  };
};
