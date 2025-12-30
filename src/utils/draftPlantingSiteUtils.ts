import {
  CreatePlantingSiteRequestPayload,
  DraftPlantingSite,
  DraftPlantingSitePayload,
  SiteEditStep,
  SiteType,
} from 'src/types/PlantingSite';
import { MinimalStratum, MultiPolygon, PlantingSeason } from 'src/types/Tracking';

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
    plantingSeasons,
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
    plantingSeasons,
    strata,
    siteEditStep,
    siteType,
  };

  const numStrata = strata?.length;
  const numSubstrata = strata?.flatMap((zone) => zone.substrata)?.length;

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

// convert from BE representation to client representation
export const toDraft = (payload: DraftPlantingSitePayload): DraftPlantingSite => {
  const { createdBy, data, description, id, name, organizationId, projectId, timeZone } = payload;

  const boundary: MultiPolygon | undefined = data.boundary as MultiPolygon | undefined;
  const exclusion: MultiPolygon | undefined = data.exclusion as MultiPolygon | undefined;
  const plantingSeasons: PlantingSeason[] = data.plantingSeasons as PlantingSeason[];
  const strata: MinimalStratum[] | undefined = data.strata as MinimalStratum[] | undefined;
  const siteEditStep: SiteEditStep = data.siteEditStep as SiteEditStep;
  const siteType: SiteType = data.siteType as SiteType;

  return {
    boundary,
    createdBy,
    description,
    exclusion,
    id,
    name,
    organizationId,
    plantingSeasons,
    strata,
    projectId,
    siteEditStep,
    siteType,
    timeZone,
  };
};

export const fromDraftToCreate = (site: DraftPlantingSite): CreatePlantingSiteRequestPayload => {
  const { boundary, description, exclusion, name, organizationId, plantingSeasons, strata, projectId, timeZone } = site;

  return {
    boundary,
    description,
    exclusion,
    name,
    organizationId,
    plantingSeasons,
    plantingZones: strata,
    projectId,
    timeZone,
  };
};
