import { ObservationResultsPayload } from 'src/queries/generated/observations';
import { ObservationSpeciesResults, ObservationSpeciesResultsPayload } from 'src/types/Observations';

export const getObservationSpeciesLivePlantsCount = (
  species: ObservationSpeciesResults[] | ObservationSpeciesResultsPayload[] | undefined
): number | undefined => {
  return species && species.length > 0 ? species.reduce((sum, s) => sum + (s.totalLive || 0), 0) : undefined;
};

export const getObservationSpeciesDeadPlantsCount = (
  species: ObservationSpeciesResults[] | ObservationSpeciesResultsPayload[] | undefined
): number | undefined => {
  return species && species.length > 0 ? species?.reduce((sum, s) => sum + (s.totalDead || 0), 0) : undefined;
};

export const hasPendingResults = (results: ObservationResultsPayload | undefined): boolean =>
  !!results &&
  (results.pending ||
    results.strata.some(
      (stratum) =>
        stratum.pending ||
        stratum.substrata.some(
          (substratum) => substratum.pending || substratum.monitoringPlots.some((plot) => plot.pending)
        )
    ));
