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
