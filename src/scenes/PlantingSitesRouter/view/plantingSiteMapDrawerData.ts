import { MapLayerFeatureId } from 'src/components/NewMap/types';
import { PlantingSitePayload, PlantingSiteSpeciesTargetPayload } from 'src/queries/generated/plantingSites';

export type PlantingSiteDrawerData =
  | {
      type: 'site';
      name: string;
      areaHa: number | undefined;
      plantingComplete: boolean;
      strataCount: number;
      substrataCount: number;
    }
  | {
      type: 'stratum';
      name: string;
      areaHa: number;
      plantingComplete: boolean;
      initialPlantingDensity: number;
      targetPlantDensity: number | undefined;
      speciesIds: number[];
    }
  | {
      type: 'substratum';
      name: string;
      stratumName: string;
      areaHa: number;
      plantingComplete: boolean;
      initialPlantingDensity: number;
      targetPlantDensity: number | undefined;
    };

export const getPlantingSiteMapDrawerData = (
  plantingSite: PlantingSitePayload | undefined,
  layerFeatureId: MapLayerFeatureId,
  speciesTargets?: PlantingSiteSpeciesTargetPayload[]
): PlantingSiteDrawerData | undefined => {
  if (!plantingSite) {
    return undefined;
  }

  const strata = plantingSite.strata ?? [];

  if (layerFeatureId.layerId === 'sites') {
    return {
      type: 'site',
      name: plantingSite.name,
      areaHa: plantingSite.areaHa,
      plantingComplete: strata
        .flatMap((stratum) => stratum.substrata)
        .every((substratum) => substratum.plantingCompleted),
      strataCount: strata.length,
      substrataCount: strata.flatMap((stratum) => stratum.substrata).length,
    };
  }

  if (layerFeatureId.layerId === 'strata') {
    const stratum = strata.find((thisStratum) => `${thisStratum.id}` === layerFeatureId.featureId);
    if (!stratum) {
      return undefined;
    }
    return {
      type: 'stratum',
      name: stratum.name,
      areaHa: stratum.areaHa,
      plantingComplete: stratum.substrata.every((substratum) => substratum.plantingCompleted),
      initialPlantingDensity: stratum.initialPlantingDensity,
      targetPlantDensity: stratum.targetPlantDensity,
      speciesIds: (speciesTargets ?? [])
        .filter((target) => target.stratumIds.includes(stratum.id))
        .map((target) => target.speciesId),
    };
  }

  if (layerFeatureId.layerId === 'substrata') {
    const parentStratum = strata.find((thisStratum) =>
      thisStratum.substrata.some((thisSubstratum) => `${thisSubstratum.id}` === layerFeatureId.featureId)
    );
    const substratum = parentStratum?.substrata.find(
      (thisSubstratum) => `${thisSubstratum.id}` === layerFeatureId.featureId
    );
    if (!parentStratum || !substratum) {
      return undefined;
    }
    return {
      type: 'substratum',
      name: substratum.name,
      stratumName: parentStratum.name,
      areaHa: substratum.areaHa,
      plantingComplete: substratum.plantingCompleted,
      initialPlantingDensity: parentStratum.initialPlantingDensity,
      targetPlantDensity: parentStratum.targetPlantDensity,
    };
  }

  return undefined;
};
