import { DraftStratumPayload } from 'src/queries/generated/draftPlantingSites';
import {
  BoundarySource,
  CreateDraftPlantingSiteRequestPayload,
  CreatePlantingSiteRequestPayload,
  DraftPlantingSite,
  DraftPlantingSitePayload,
  SiteEditStep,
} from 'src/types/PlantingSite';
import { MinimalStratum, MultiPolygon } from 'src/types/Tracking';

const toStratumPayload = ({
  boundary,
  initialPlantingDensity,
  name,
  substrata,
}: MinimalStratum): DraftStratumPayload => ({
  boundary,
  initialPlantingDensity,
  name,
  substrata: substrata.map((substratum) => ({ boundary: substratum.boundary, name: substratum.name })),
});

const toStratum = ({ boundary, id, initialPlantingDensity, name, substrata }: DraftStratumPayload): MinimalStratum => ({
  boundary: boundary as MultiPolygon,
  id: id ?? 0,
  initialPlantingDensity,
  name,
  substrata: substrata.map((substratum) => ({
    boundary: substratum.boundary as MultiPolygon,
    fullName: substratum.name,
    id: substratum.id ?? 0,
    name: substratum.name,
    plantingCompleted: false,
  })),
});

// convert from client representation to BE representation
export const fromDraft = (site: DraftPlantingSite): CreateDraftPlantingSiteRequestPayload => {
  const {
    boundary,
    boundarySource,
    description,
    exclusion,
    name,
    organizationId,
    strata,
    projectId,
    siteEditStep,
    siteType,
    timeZone,
  } = site;

  return {
    boundary,
    boundarySource,
    description,
    exclusion,
    name,
    organizationId,
    projectId,
    siteEditStep,
    siteType,
    strata: siteType === 'Detailed' ? strata?.map(toStratumPayload) : undefined,
    timeZone,
  };
};

// convert from BE representation to client representation
export const toDraft = (payload: DraftPlantingSitePayload): DraftPlantingSite => {
  const {
    boundary,
    boundarySource,
    createdBy,
    description,
    exclusion,
    id,
    name,
    organizationId,
    projectId,
    siteEditStep,
    siteType,
    strata,
    timeZone,
  } = payload;

  return {
    boundary: boundary as MultiPolygon | undefined,
    ...(boundarySource ? { boundarySource: boundarySource as BoundarySource } : {}),
    createdBy,
    description,
    exclusion: exclusion as MultiPolygon | undefined,
    id,
    name,
    organizationId,
    strata: strata.length ? strata.map(toStratum) : undefined,
    projectId,
    siteEditStep: (siteEditStep ?? 'site_boundary') as SiteEditStep,
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
