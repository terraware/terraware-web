import { ExistingBiomassMeasurementPayload } from 'src/queries/generated/observations';
import { ObservationSpeciesResults, ObservationSpeciesResultsPayload } from 'src/types/Observations';

export const getObservationSpeciesLivePlantsCount = (
  species: ObservationSpeciesResults[] | ObservationSpeciesResultsPayload[] | undefined
): number | undefined => {
  return species?.reduce((sum, s) => sum + (s.totalLive || 0), 0);
};

export const getObservationSpeciesDeadPlantsCount = (
  species: ObservationSpeciesResults[] | ObservationSpeciesResultsPayload[] | undefined
): number | undefined => {
  return species?.reduce((sum, s) => sum + (s.totalDead || 0), 0);
};

export const getBiomassObservationLiveTreeCount = (
  biomassMeasurement: ExistingBiomassMeasurementPayload | undefined
) => {
  if (!biomassMeasurement) {
    return 0;
  }
  return biomassMeasurement.trees.filter((tree) => !tree.isDead).length;
};

export const getBiomassObservationDeadTreeCount = (
  biomassMeasurement: ExistingBiomassMeasurementPayload | undefined
) => {
  if (!biomassMeasurement) {
    return 0;
  }
  return biomassMeasurement.trees.filter((tree) => tree.isDead).length;
};
