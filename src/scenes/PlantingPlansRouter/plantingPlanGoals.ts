import { PlantingSitePayload, StratumResponsePayload } from 'src/queries/generated/plantingSites';

export type DensityType = 'initial' | 'target';

export const stratumDensity = (stratum: StratumResponsePayload, type: DensityType): number | undefined =>
  type === 'initial' ? stratum.initialPlantingDensity : stratum.targetPlantDensity;

export const plantsForArea = (areaHa: number, density: number | undefined): number | undefined =>
  density === undefined ? undefined : Math.round(areaHa * density);

export const stratumPlants = (stratum: StratumResponsePayload, type: DensityType): number | undefined =>
  plantsForArea(stratum.areaHa, stratumDensity(stratum, type));

export const siteGoalPlants = (plantingSite: PlantingSitePayload, type: DensityType): number | undefined => {
  let total = 0;
  let anyDensitySet = false;
  (plantingSite.strata ?? []).forEach((stratum) => {
    const plants = stratumPlants(stratum, type);
    if (plants !== undefined) {
      total += plants;
      anyDensitySet = true;
    }
  });
  return anyDensitySet ? total : undefined;
};

export const siteDensity = (plantingSite: PlantingSitePayload, type: DensityType): number | undefined => {
  const plants = siteGoalPlants(plantingSite, type);
  if (plants === undefined || !plantingSite.areaHa) {
    return undefined;
  }
  return Math.round(plants / plantingSite.areaHa);
};
