import _ from 'lodash';

import { PlantingSitePayload, UpdatePlantingSiteMapRequestPayload } from 'src/queries/generated/plantingSites';
import { EditorPlantingSite } from 'src/types/PlantingSite';
import { MinimalStratum } from 'src/types/Tracking';

export const toEditorSite = (site: PlantingSitePayload): EditorPlantingSite => {
  const { boundary, description, exclusion, id, name, organizationId, projectId, strata, timeZone } = site;

  return {
    boundary,
    description,
    exclusion,
    id,
    name,
    organizationId,
    projectId,
    siteType: 'Detailed',
    strata: strata?.map((stratum): MinimalStratum => ({
      ..._.omit(stratum, ['areaHa', 'boundaryModifiedTime', 'numPermanentPlots', 'numTemporaryPlots']),
      substrata: stratum.substrata.map((substratum) => _.omit(substratum, ['areaHa', 'monitoringPlots'])),
    })),
    timeZone,
  };
};

// strata and substrata the editor created have local keys, which must not be sent as ids
export const toPlantingSiteMapEdit = (
  site: EditorPlantingSite,
  loaded: PlantingSitePayload,
  substratumIdsToMarkIncomplete?: number[]
): UpdatePlantingSiteMapRequestPayload => {
  const stratumIds = new Set(loaded.strata?.map((stratum) => stratum.id));
  const substratumIds = new Set(loaded.strata?.flatMap((stratum) => stratum.substrata.map(({ id }) => id)));

  return {
    boundary: site.boundary,
    exclusion: site.exclusion,
    strata: (site.strata ?? []).map((stratum) => ({
      ...(stratumIds.has(stratum.id) ? { id: stratum.id } : {}),
      name: stratum.name,
      substrata: stratum.substrata.map((substratum) => ({
        boundary: substratum.boundary,
        ...(substratumIds.has(substratum.id) ? { id: substratum.id } : {}),
        name: substratum.name,
      })),
    })),
    ...(substratumIdsToMarkIncomplete ? { substratumIdsToMarkIncomplete } : {}),
  };
};

export type EditedCompletedSubstratum = {
  id: number;
  stratumName: string;
  substratumName: string;
};

// substrata that were planted but whose boundaries changed, which the user may want to mark as not finished planting
export const getEditedCompletedSubstrata = (
  site: EditorPlantingSite,
  loaded: PlantingSitePayload
): EditedCompletedSubstratum[] => {
  const completed = new Map(
    (loaded.strata ?? [])
      .flatMap((stratum) => stratum.substrata)
      .filter((substratum) => substratum.plantingCompleted)
      .map((substratum) => [substratum.id, substratum])
  );

  return (site.strata ?? []).flatMap((stratum) =>
    stratum.substrata
      .filter((substratum) => {
        const original = completed.get(substratum.id);
        return !!original && !_.isEqual(original.boundary, substratum.boundary);
      })
      .map((substratum) => ({ id: substratum.id, stratumName: stratum.name, substratumName: substratum.name }))
  );
};
