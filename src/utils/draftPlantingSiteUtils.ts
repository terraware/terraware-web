import {
  CreatePlantingSiteRequestPayload,
  DraftPlantingSite,
  DraftPlantingSitePayload,
  SiteEditStep,
  SiteType,
} from 'src/types/PlantingSite';
import { MinimalPlantingZone, MultiPolygon, PlantingSeason } from 'src/types/Tracking';

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
    plantingZones,
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
    plantingZones,
    siteEditStep,
    siteType,
  };

  const numStrata = plantingZones?.length;
  const numSubstrata = plantingZones?.flatMap((zone) => zone.plantingSubzones)?.length;

  const payload: DraftPlantingSitePayload = {
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

  return payload;
};

// convert from BE representation to client representation
export const toDraft = (payload: DraftPlantingSitePayload): DraftPlantingSite => {
  const { createdBy, data, description, id, name, organizationId, projectId, timeZone } = payload;

  const boundary: MultiPolygon | undefined = data.boundary as MultiPolygon | undefined;
  const exclusion: MultiPolygon | undefined = data.exclusion as MultiPolygon | undefined;
  const plantingSeasons: PlantingSeason[] = data.plantingSeasons as PlantingSeason[];
  const plantingZones: MinimalPlantingZone[] | undefined = data.plantingZones as MinimalPlantingZone[] | undefined;
  const siteEditStep: SiteEditStep = data.siteEditStep as SiteEditStep;
  const siteType: SiteType = data.siteType as SiteType;

  const draft: DraftPlantingSite = {
    boundary,
    createdBy,
    description,
    exclusion,
    id,
    name,
    organizationId,
    plantingSeasons,
    plantingZones,
    projectId,
    siteEditStep,
    siteType,
    timeZone,
  };

  return draft;
};

export const fromDraftToCreate = (site: DraftPlantingSite): CreatePlantingSiteRequestPayload => {
  const {
    boundary,
    description,
    exclusion,
    name,
    organizationId,
    plantingSeasons,
    plantingZones,
    projectId,
    timeZone,
  } = site;

  const payload: CreatePlantingSiteRequestPayload = {
    boundary,
    description,
    exclusion,
    name,
    organizationId,
    plantingSeasons,
    plantingZones,
    projectId,
    timeZone,
  };

  return payload;
};
